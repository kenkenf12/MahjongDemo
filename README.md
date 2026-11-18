# Four-Player Hong Kong Mahjong – Spec-Driven Development

A browser-based, real-time multiplayer Hong Kong Mahjong game for four human players. Built with spec-driven development and demonstrating Kiro's agentic coding capabilities.

## Quick Links

- **[REQUIREMENTS.md](REQUIREMENTS.md)** – Functional and non-functional requirements.
- **[DESIGN.md](DESIGN.md)** – Architecture, design decisions, data flow.
- **[TASKS.md](TASKS.md)** – Implementation roadmap by stage (1–8).
- **[SPEC_REVIEW.md](SPEC_REVIEW.md)** – Critical assumptions, open questions, spec checklist.
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** – Directory layout and file organization.
- **[DEPLOYMENT.md](DEPLOYMENT.md)** – Deployment instructions (to be created).

## Overview

### What is This Project?

A fully playable Hong Kong Mahjong game where:
- **Four players** join a shared game room using a browser on any device (mobile, tablet, desktop).
- **Each player** sees their own concealed hand and all players' open melds and scores.
- **Real-time multiplayer** using WebSocket for instant state synchronization.
- **No server hosting required** – Players don't need to run a server or install an app.
- **Simple room-based access** – Create a room, share the code, other players join.

### Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | TypeScript, vanilla JavaScript, CSS, HTML |
| **Frontend Hosting** | GitHub Pages |
| **Backend** | Cloudflare Workers + Durable Objects |
| **WebSocket** | Real-time bidirectional messaging |
| **Database** | None (ephemeral room state) |
| **Authentication** | Room code + session ID (lightweight) |

## Project Status

**Current Phase**: Specification Complete – Ready for Implementation

This repo contains **specification documents** (requirements, design, task breakdown) but **no implementation code yet**. The spec has been created following Kiro's spec-driven development approach.

### What Has Been Completed

1. ✅ **Requirements Document** – Functional and non-functional requirements, scope, assumptions.
2. ✅ **Design Document** – Three-layer architecture, data flow, WebSocket protocol, deployment topology.
3. ✅ **Task Breakdown** – 8 stages of implementation, each with deliverables and acceptance criteria.
4. ✅ **Spec Review** – Critical assumptions about game rules, open questions, validation checklist.
5. ✅ **Project Structure** – Directory layout, file organization, configuration files.

### What Needs to Happen Next

1. **User Review**: Confirm game rules, deployment model, and answer open questions (see [SPEC_REVIEW.md](SPEC_REVIEW.md)).
2. **GitHub Repository Setup**: Create `major-demo` repo with initial directory structure.
3. **Implementation**: Build stages 1–8 in order (starting with rules engine, ending with E2E testing).

## Key Decisions

### Architecture

- **Frontend is a "dumb terminal"**: All game logic runs on the server; frontend only renders state and sends commands.
- **Server is the source of truth**: No cheating possible; all moves validated server-side.
- **Ephemeral room state**: Rooms are temporary; no persistent database for MVP.
- **Lightweight security**: Room code + session ID (suitable for casual, trusted group play).

### Technology Choices

- **Cloudflare Workers + Durable Objects**: Free tier, no infrastructure setup, WebSocket support built-in.
- **GitHub Pages**: Static hosting, no backend server needed for frontend.
- **Vanilla TypeScript**: Keeps bundle size small, simplifies deployment, makes architecture transparent.
- **WebSocket**: Real-time communication; simple protocol for game events.

### Game Rules (Provisional)

**These assumptions must be confirmed before implementation:**

- Winning hand: **4 melds + 1 pair** (configurable minimum 1 fan).
- Fan values:
  - Pong (triplet): 1 fan.
  - Kong (concealed): 2 fan.
  - Kong (exposed): 1 fan.
  - Flower/season: 1 fan each.
  - All Simples (2–8): 2 fan.
  - All Terminals/Honors: 1 fan.
- Dealer multiplier: **2× if dealer wins or loses** (on their discard).
- Dealer rotation: **Stays if won, rotates clockwise if lost**.
- Chow: **Only from player to the right** (clockwise predecessor).
- Claim priority: **Win > Kong > Pong > Chow**.
- Draw game: **All-pass when wall exhausted, no payments**.
- Disconnection timeout: **5 minutes** (reconnect restores game state).

See [SPEC_REVIEW.md](SPEC_REVIEW.md) for detailed rule questions.

## Implementation Roadmap

### Stage 1: Core Tile and Rules Engine (2–3 days)
- Tile model and constants.
- Wall initialization, shuffling, dealing.
- Hand validation and winning pattern recognition.
- Fan calculation.

### Stage 2: Game State and Turn Sequence (2–3 days)
- Game state model.
- Turn manager and action flow.
- Settlement and scoring.

### Stage 3: Basic Mobile UI (2 days)
- Frontend project setup.
- Game view and player hand display.
- Action buttons.
- Tile graphics.

### Stage 4: Room Management (Offline) (1 day)
- Lobby screen and room creation/joining.
- Local room state management.

### Stage 5: WebSocket Multiplayer (2–3 days)
- Cloudflare Workers setup.
- Durable Object game room.
- Four-player game flow.
- Reconnection handling.

### Stage 6: Results and Settlement UI (1 day)
- Result screen with fan and settlement details.
- Draw game result handling.

### Stage 7: Error Handling and Edge Cases (1–2 days)
- Input validation.
- Duplicate action prevention.
- Error messages and logging.

### Stage 8: Testing and Refinement (2–3 days)
- Integration tests.
- Performance testing.
- UI/UX polish.
- Documentation and deployment.

**Total Estimated Time**: 13–18 days

## File Structure

```
major-demo/
├── README.md                 # This file
├── REQUIREMENTS.md           # Functional and non-functional requirements
├── DESIGN.md                 # Architecture and design
├── TASKS.md                  # Implementation task breakdown
├── SPEC_REVIEW.md            # Spec review checklist and open questions
├── PROJECT_STRUCTURE.md      # Directory layout and conventions
├── DEPLOYMENT.md             # Deployment instructions (not yet written)
│
├── frontend/                 # GitHub Pages static app
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.js
│   ├── index.html
│   ├── src/
│   ├── styles/
│   └── assets/
│
├── backend/                  # Cloudflare Workers + Durable Objects
│   ├── package.json
│   ├── tsconfig.json
│   ├── wrangler.toml
│   ├── src/
│   │   ├── index.ts
│   │   ├── durable_objects/
│   │   ├── game/
│   │   ├── models/
│   │   ├── config/
│   │   └── ...
│   └── tests/
│
├── .github/
│   └── workflows/            # CI/CD pipelines
│
└── .gitignore
```

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed file listing.

## How to Review This Spec

### For Game Rule Experts

1. Read [SPEC_REVIEW.md](SPEC_REVIEW.md) Section 3 (Game Rules Assumptions).
2. Verify each assumption matches your group's rules.
3. Raise any conflicts or special cases.

### For Architects

1. Read [DESIGN.md](DESIGN.md) for architecture overview.
2. Review the three-layer design (frontend, backend, Durable Objects).
3. Check the WebSocket protocol (Section 2.4 of DESIGN.md).
4. Validate security and data consistency model (Section 6 of DESIGN.md).

### For Developers

1. Read [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for file organization.
2. Review [TASKS.md](TASKS.md) for stage-by-stage breakdown.
3. Examine the data models in [DESIGN.md](DESIGN.md) (Tile, Meld, Player, GameState).

### For Product Managers

1. Read [REQUIREMENTS.md](REQUIREMENTS.md) for feature list and success criteria.
2. Review [SPEC_REVIEW.md](SPEC_REVIEW.md) Section 8 (Spec Review Checklist) for sign-off items.
3. Check [TASKS.md](TASKS.md) for effort estimates and critical path.

## Critical Questions Requiring User Input

**Before implementation begins, please confirm:**

1. **Game Rules**: Are the assumed Hong Kong Mahjong rules correct for your group? (See [SPEC_REVIEW.md](SPEC_REVIEW.md) Section 3.)
2. **Minimum Fan**: Should a player need 1 fan, 0 fan, or 3+ fan to win?
3. **Room Model**: Is ephemeral (temporary, non-persistent) room state acceptable?
4. **Player Count**: Always exactly 4 players (no variants)?
5. **Deployment**: Are Cloudflare Workers and GitHub Pages acceptable for hosting?

See [SPEC_REVIEW.md](SPEC_REVIEW.md) Section 8 (Spec Review Checklist) for the full sign-off list.

## Development Philosophy

This project demonstrates:

1. **Spec-Driven Development**: Complete spec *before* implementation. Requirements, design, and tasks are detailed and actionable.
2. **Clear Architecture**: Three-layer separation (frontend, backend, Durable Objects) makes each layer testable and scalable.
3. **Staged Implementation**: Build in small, testable stages. Each stage has clear deliverables and can be verified independently.
4. **Server Authority**: All game logic on the server; frontend is trusted only to render state. Prevents cheating and ensures consistency.
5. **Transparent Design**: Every file, function, and message is documented so developers can understand the system.

## Future Enhancements (Out of MVP Scope)

- Leaderboards and player statistics (requires database).
- Game replay and history (requires persistent storage).
- Tile themes and custom graphics (requires asset creation).
- Multiple rounds per room (requires state management).
- 3-player or 2-player variants (requires rule engine extension).
- Time limits per turn (requires client-side timer UI).
- Persistent player accounts (requires authentication backend).

## Questions or Feedback?

If you have questions about the spec, rules clarifications, or architecture feedback:

1. Open an issue in the GitHub repo.
2. Update [SPEC_REVIEW.md](SPEC_REVIEW.md) with your questions.
3. Tag the design docs with clarifications.

---

**Project Version**: 1.0  
**Spec Status**: Complete and Ready for Review  
**Created**: [Timestamp]  
**Next Phase**: User Review and Confirmation  

---

## Acknowledgments

- **Design Approach**: Spec-driven development, inspired by Kiro's philosophy of planning before building.
- **Architecture**: Leverages Cloudflare Workers' free tier for scalable, serverless backend.
- **Tech Stack**: Vanilla TypeScript + WebSocket for simplicity and transparency.
- **Game Rules**: Based on standard Hong Kong Mahjong conventions (regional variations noted).

---

For detailed information, see the individual spec documents:
- [REQUIREMENTS.md](REQUIREMENTS.md) – What we're building
- [DESIGN.md](DESIGN.md) – How we're building it
- [TASKS.md](TASKS.md) – Breaking it down into stages
- [SPEC_REVIEW.md](SPEC_REVIEW.md) – Critical decisions and open questions
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) – Where everything goes
