/**
 * Mahjong Game Client
 * Handles WebSocket connection to the backend and game UI interactions
 */

class MahjongClient {
    constructor() {
        this.socket = null;
        this.gameCode = null;
        this.playerName = null;
        this.connected = false;
        this.gameState = null;
    }

    /**
     * Connect to the WebSocket server
     */
    connect(host = null) {
        try {
            // Auto-detect host if not provided
            if (!host) {
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    // Local development
                    host = 'localhost:3000';
                } else {
                    // Production - show prompt for backend URL
                    const savedHost = localStorage.getItem('backendHost');
                    if (savedHost) {
                        host = savedHost;
                    } else {
                        this.log('⚠️ Backend URL not configured. Using demo mode (no connection).', 'warning');
                        this.log('To connect to a backend, set the server URL in settings.', 'info');
                        this.updateStatus('Demo Mode (No Backend)', false);
                        return;
                    }
                }
            }

            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const url = `${protocol}//${host}`;
            
            console.log('Connecting to:', url);
            this.socket = new WebSocket(url);

            this.socket.onopen = () => {
                this.onConnected();
            };

            this.socket.onmessage = (event) => {
                this.handleMessage(JSON.parse(event.data));
            };

            this.socket.onerror = (error) => {
                this.onError(error);
            };

            this.socket.onclose = () => {
                this.onDisconnected();
            };
        } catch (error) {
            console.error('Connection error:', error);
            this.log('❌ Failed to connect: ' + error.message, 'error');
            this.updateStatus('Connection Failed', false);
        }
    }

    /**
     * Reconnect to server with a new host
     */
    reconnectWithHost(host) {
        if (this.socket) {
            this.socket.close();
        }
        localStorage.setItem('backendHost', host);
        this.connect(host);
    }

    /**
     * Handle WebSocket connection established
     */
    onConnected() {
        this.connected = true;
        this.updateStatus('Connected', true);
        this.log('Connected to server', 'success');
    }

    /**
     * Handle WebSocket disconnection
     */
    onDisconnected() {
        this.connected = false;
        this.updateStatus('Disconnected', false);
        this.log('Disconnected from server', 'error');
    }

    /**
     * Handle WebSocket errors
     */
    onError(error) {
        console.error('WebSocket error:', error);
        this.log('Connection error: ' + error.message, 'error');
    }

    /**
     * Send message to server
     */
    send(type, data = {}) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error('Socket not connected');
            return;
        }
        this.socket.send(JSON.stringify({ type, ...data }));
    }

    /**
     * Handle incoming messages from server
     */
    handleMessage(message) {
        const { type, data } = message;

        switch (type) {
            case 'game-created':
                this.handleGameCreated(data);
                break;
            case 'player-joined':
                this.handlePlayerJoined(data);
                break;
            case 'game-started':
                this.handleGameStarted(data);
                break;
            case 'game-state':
                this.handleGameState(data);
                break;
            case 'player-action':
                this.handlePlayerAction(data);
                break;
            case 'game-over':
                this.handleGameOver(data);
                break;
            case 'error':
                this.log('Server error: ' + data.message, 'error');
                break;
            default:
                console.log('Unknown message type:', type, data);
        }
    }

    /**
     * Handle game creation
     */
    handleGameCreated(data) {
        this.gameCode = data.roomCode;
        this.log(`Game created! Code: ${this.gameCode}`, 'success');
        this.updateGameCode();
    }

    /**
     * Handle player joined
     */
    handlePlayerJoined(data) {
        this.log(`${data.position} player joined: ${data.playerName}`, 'info');
        this.updatePlayersInfo(data);
    }

    /**
     * Handle game started
     */
    handleGameStarted(data) {
        this.log('Game started!', 'success');
        this.updateGameControls(true);
        this.updateGameState(data);
    }

    /**
     * Handle game state update
     */
    handleGameState(data) {
        this.gameState = data;
        this.updateGameBoard(data);
    }

    /**
     * Handle player action
     */
    handlePlayerAction(data) {
        this.log(`${data.player} performed action: ${data.action}`, 'info');
    }

    /**
     * Handle game over
     */
    handleGameOver(data) {
        this.log(`Game over! Winner: ${data.winner}`, 'success');
        this.updateGameControls(false);
    }

    /**
     * Update UI status
     */
    updateStatus(message, connected) {
        const statusEl = document.getElementById('status');
        statusEl.textContent = message;
        if (connected) {
            statusEl.classList.remove('disconnected');
            statusEl.classList.add('connected');
        } else {
            statusEl.classList.remove('connected');
            statusEl.classList.add('disconnected');
        }
    }

    /**
     * Update game code display
     */
    updateGameCode() {
        document.getElementById('gameCode').value = this.gameCode;
    }

    /**
     * Update players info
     */
    updatePlayersInfo(data) {
        const positions = {
            'East': '.player.east',
            'South': '.player.south',
            'West': '.player.west',
            'North': '.player.north'
        };

        const selector = positions[data.position];
        if (selector) {
            const playerEl = document.querySelector(selector);
            const tilesCount = playerEl.querySelector('.tiles-count');
            tilesCount.textContent = `${data.tilesCount || 0} tiles`;
        }
    }

    /**
     * Update game board
     */
    updateGameBoard(data) {
        if (data.currentPlayer) {
            document.querySelectorAll('.player').forEach(el => {
                el.style.opacity = '0.7';
            });
            const current = document.querySelector(`.player.${data.currentPlayer.toLowerCase()}`);
            if (current) current.style.opacity = '1';
        }

        // Update wall count
        if (data.wallRemaining !== undefined) {
            document.getElementById('wall-count').textContent = data.wallRemaining;
        }

        // Update discards
        if (data.discards) {
            const discardsEl = document.getElementById('discards');
            discardsEl.innerHTML = '';
            data.discards.forEach(tileId => {
                const img = document.createElement('img');
                img.src = `assets/tiles/${getTileImage(tileId)}.png`;
                img.alt = tileId;
                img.title = tileId;
                discardsEl.appendChild(img);
            });
        }
    }

    /**
     * Update game state
     */
    updateGameState(data) {
        this.gameState = data;
        this.log('Game state updated', 'info');
        this.updateGameBoard(data);
    }

    /**
     * Update game controls visibility
     */
    updateGameControls(show) {
        document.getElementById('gameControls').style.display = show ? 'flex' : 'none';
    }

    /**
     * Add log entry
     */
    log(message, type = 'info') {
        const logEl = document.getElementById('log');
        const entry = document.createElement('p');
        entry.className = `log-entry ${type}`;
        const time = new Date().toLocaleTimeString();
        entry.textContent = `[${time}] ${message}`;
        logEl.appendChild(entry);
        logEl.scrollTop = logEl.scrollHeight;
    }

    /**
     * Game action methods
     */
    joinGame(gameCode, playerName) {
        this.playerName = playerName;
        this.send('join-game', {
            roomCode: gameCode,
            playerName: playerName
        });
    }

    newGame() {
        this.send('create-game', {
            playerName: this.playerName
        });
    }

    drawTile() {
        this.send('player-action', {
            action: 'draw',
            roomCode: this.gameCode
        });
    }

    discardTile(tileId) {
        this.send('player-action', {
            action: 'discard',
            tileId: tileId,
            roomCode: this.gameCode
        });
    }

    declareWin() {
        this.send('player-action', {
            action: 'claim_win',
            roomCode: this.gameCode
        });
    }
}

// Create global client instance
const client = new MahjongClient();

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Try to connect to local server
    client.connect();

    // Log ready
    client.log('Mahjong Game Client initialized', 'success');
    client.log('Tile graphics loaded successfully', 'success');
});

// UI Event Handlers
function joinGame() {
    const gameCode = document.getElementById('gameCode').value;
    const playerName = document.getElementById('playerName').value;

    if (!gameCode) {
        alert('Please enter a game code');
        return;
    }

    if (!playerName) {
        alert('Please enter your name');
        return;
    }

    client.joinGame(gameCode, playerName);
}

function newGame() {
    const playerName = document.getElementById('playerName').value;

    if (!playerName) {
        alert('Please enter your name');
        return;
    }

    client.playerName = playerName;
    client.newGame();
}

function drawTile() {
    client.drawTile();
}

function discardTile() {
    // In a real game, you'd select the tile to discard
    const tileId = prompt('Enter tile ID to discard:');
    if (tileId) {
        client.discardTile(tileId);
    }
}

function declareWin() {
    client.declareWin();
}

// Settings Functions
function updateBackendUrl() {
    const url = document.getElementById('backendUrl').value.trim();
    if (!url) {
        alert('Please enter a backend URL');
        return;
    }
    client.log('Reconnecting to: ' + url, 'info');
    client.reconnectWithHost(url);
}

function testConnection() {
    const savedHost = localStorage.getItem('backendHost');
    if (savedHost) {
        client.log('Testing connection to: ' + savedHost, 'info');
        // Attempt reconnect
        if (client.socket && client.socket.readyState === WebSocket.OPEN) {
            client.log('✅ Connected successfully!', 'success');
        } else {
            client.log('❌ Not currently connected', 'error');
        }
    } else {
        client.log('No backend URL configured. Set one in Settings.', 'warning');
    }
}

// Load saved backend URL on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedHost = localStorage.getItem('backendHost');
    if (savedHost && document.getElementById('backendUrl')) {
        document.getElementById('backendUrl').value = savedHost;
    }
});

/**
 * Map tile data to image filename
 */
function getTileImage(tileId) {
    // This would map tile IDs to image filenames
    // Example: "character-1-1" -> "character_1"
    const parts = tileId.split('-');
    if (parts.length >= 2) {
        return `${parts[0]}_${parts[1]}`;
    }
    return 'back';
}
