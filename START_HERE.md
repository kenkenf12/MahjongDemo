# 🀄 Hong Kong Mahjong – START HERE

Welcome! This document is your guide to the Four-Player Hong Kong Mahjong game specification.

## TL;DR

**What**: Browser-based real-time multiplayer Hong Kong Mahjong for 4 players.  
**How**: Hosted on GitHub Pages (frontend) + Cloudflare Workers (backend).  
**Status**: ✅ Stage 0 (Payment Calculator) Complete | Stages 1-8 Ready to Begin  
**Next Step**: Read [PROJECT_STATUS.md](#project-status-current-stage) for current progress, then begin Stage 1.

---

## 🎯 CURRENT STAGE: Stage 0 - Payment Calculator ✅ COMPLETE

**What Just Shipped**: A production-ready payment calculation engine implementing all Q1-Q5 business rules.

| Component | Status |
|-----------|--------|
| **Q1: Discard Payment** | ✅ Done - Only discarder pays |
| **Q2: Self-Draw Payment** | ✅ Done - All 3 players pay equally |
| **Q3: Pao Liability** | ✅ Done - Separate liability player |
| **Q4: Payment Caps** | ✅ Done - Fan cap + per-loser cap |
| **Q5: No Dealer Multipliers** | ✅ Done - Uniform rates for all positions |

**Metrics**:
- ✅ 85/85 tests passing (100%)
- ✅ 84% code coverage
- ✅ 810 lines of source code
- ✅ 0 build errors

**Next**: Read [PROJECT_STATUS.md](PROJECT_STATUS.md) for detailed status, then proceed to Stage 1 (Tile Model).

---

## 📚 Documentation Guide

Read these documents **in this order**:

### 0. **PROJECT_STATUS.md** (NEW - READ FIRST)
Where we are right now. Current stage, what's complete, what's next.

**What you'll learn**:
- Stage 0 (Payment Calculator) - COMPLETE ✅
- Test results and metrics
- Integration points for next stages
- How to proceed with Stage 1

**👉 Read this FIRST**: Essential for understanding current project state.

### 1. **START_HERE.md** (this file)
Quick orientation. Read first to get your bearings.

### 2. **README.md** (5 min read)
High-level overview of the entire project. Links to all other documents.

**What you'll learn**:
- Project vision and success criteria
- Technology stack at a glance
- Architecture diagram
- 8-stage implementation roadmap
- Future enhancements (out of scope)

**👉 Read this next if**: You want a 5-minute overview.

### 3. **SPEC_SUMMARY.txt** (10 min read)
Visual summary with ASCII diagrams and quick reference tables.

**What you'll learn**:
- Game flow (from room creation to winner determined)
- Architecture diagram
- Game assumptions (provisional)
- Tech stack breakdown
- Implementation stages with effort estimates
- Open questions

**👉 Read this next if**: You like visual summaries and quick facts.

### 4. **REQUIREMENTS.md** (20 min read)
Detailed functional and non-functional requirements. The "what" we're building.

**What you'll learn**:
- Complete feature list (room management, game flow, UI, multiplayer)
- Tile set specification (144 tiles)
- Game rules and winning conditions
- Mobile UI requirements
- Security requirements
- Success criteria
- Out-of-scope features
- Assumptions and clarifications

**👉 Read this if**: You need to understand ALL features and requirements.

### 5. **DESIGN.md** (30 min read)
Architecture, data flow, and technical design. The "how" we're building it.

**What you'll learn**:
- Three-layer architecture (frontend, backend, Durable Objects)
- Frontend state management and UI rendering
- WebSocket message protocol (client ↔ server)
- Data flow for a complete game turn
- Tile and hand management
- Security model
- Error handling and recovery
- Configuration and rules
- Deployment topology

**👉 Read this if**: You need to understand how the system works.

### 6. **TASKS.md** (20 min read)
Implementation roadmap broken into 8 stages. Each stage has deliverables, tests, and acceptance criteria.

**What you'll learn**:
- Stage 1: Tile model, dealing, hand validation, fan calculation
- Stage 2: Game state model, turn sequence, settlement
- Stage 3: Mobile UI (GameView, buttons, notifications)
- Stage 4: Room creation and joining
- Stage 5: WebSocket multiplayer (critical integration)
- Stage 6: Results screen and settlement UI
- Stage 7: Error handling and edge cases
- Stage 8: Testing, performance, deployment

**👉 Read this if**: You're planning the implementation work.

### 7. **SPEC_REVIEW.md** (30 min read)
Critical decisions, assumptions, and open questions. **Must read before implementation**.

**What you'll learn**:
- Architecture summary and rationale
- Key decisions made (tile set, player count, ephemeral rooms, security model, etc.)
- Assumptions about Hong Kong Mahjong rules (PROVISIONAL – need user confirmation)
- Open questions for the user to decide
- Validation and security concerns
- Spec review checklist (sign-off items)
- Recommendations for MVP vs. future features

**👉 Read this BEFORE implementing**: Contains all the rule assumptions that need confirmation.

### 8. **PROJECT_STRUCTURE.md** (20 min read)
Directory layout, file organization, and code conventions.

**What you'll learn**:
- Complete file tree (frontend, backend, tests)
- What each directory/file contains
- Configuration files (package.json, wrangler.toml, tsconfig.json)
- Development workflow by phase
- Code style and conventions
- Performance and security considerations

**👉 Read this if**: You're setting up the GitHub repo or starting to code.

### 9. **TEST_RESULTS_FINAL.md** (NEW - Stage 0 Complete)
Complete test results and metrics for the Payment Calculator.

**What you'll learn**:
- All 85 tests passing (100% success)
- Code coverage breakdown (84% statements)
- Q1-Q5 rules verification
- Input validation testing
- Payment balance verification
- Edge cases handled

**👉 Read this if**: You want to see Stage 0 test results and metrics.

### 10. **Q1-Q5_IMPLEMENTATION_VERIFICATION.md** (NEW - Stage 0 Complete)
Exact source code showing how Q1-Q5 rules are implemented.

**What you'll learn**:
- Exact line numbers for each Q1-Q5 implementation
- Test case examples for each rule
- Code snippets showing key logic
- Verification that rules match specification

**👉 Read this if**: You want to audit the Payment Calculator source code.

---

## 🚀 Quick Start (For Different Roles)

**FIRST**: Read [PROJECT_STATUS.md](PROJECT_STATUS.md) to understand where we are.

### For **Project Managers**
1. Read PROJECT_STATUS.md (current stage overview)
2. Read README.md (overview)
3. Read SPEC_REVIEW.md Section 8 (checklist to sign off on)
4. Confirm game rules and deployment model with your team
5. Check TASKS.md for effort estimates for Stages 1-8

**Time**: 45 min

### For **Architects**
1. Read PROJECT_STATUS.md (current architecture)
2. Read README.md (overview)
3. Read DESIGN.md (architecture and data flow)
4. Review Q1-Q5_IMPLEMENTATION_VERIFICATION.md (Payment Calculator code)
5. Review SPEC_REVIEW.md for security and deployment concerns
6. Validate integration points for Stage 1-2

**Time**: 1.5 hours

### For **Developers (Backend)**
1. Read PROJECT_STATUS.md (current stage and next steps)
2. Read Q1-Q5_IMPLEMENTATION_VERIFICATION.md (Stage 0 source code)
3. Read TEST_RESULTS_FINAL.md (Stage 0 test results)
4. Read README.md (overview)
5. Read DESIGN.md (focus on Sections 3, 5, 6 – backend logic and security)
6. Read TASKS.md (focus on Stages 1-2 next)
7. Review backend/src/ code and backend/tests/

**Time**: 2 hours

### For **Developers (Frontend)**
1. Read PROJECT_STATUS.md (current stage)
2. Read README.md (overview)
3. Read DESIGN.md (focus on Section 2 – frontend architecture)
4. Read TASKS.md (focus on Stages 3, 4, 6 – UI, room management, results screen)
5. Read PROJECT_STRUCTURE.md (file organization)

**Time**: 1.5 hours

### For **Game Rules Experts**
1. Read PROJECT_STATUS.md (Q1-Q5 verification status)
2. Read Q1-Q5_IMPLEMENTATION_VERIFICATION.md (verify rules are correct)
3. Read README.md (game overview)
4. Read SPEC_REVIEW.md Section 3 (Game Rules Assumptions – check if all assumptions are correct)
5. Note any rule variations or special cases that need to be added
6. Confirm minimum fan to win, dealer multiplier, competing claims priority, etc.

**Time**: 1.5 hours

---

## 🔍 Before Implementation: Spec Review Checklist

**CRITICAL**: These items must be confirmed before coding begins.

### Game Rules (MUST CONFIRM)
- [ ] Winning hand structure: 4 melds + 1 pair?
- [ ] Minimum fan to win: 1 fan, 0 fan, or 3+ fan?
- [ ] Fan values correct for your group?
- [ ] Dealer multiplier correct?
- [ ] Dealer rotation rule correct?
- [ ] Chow eligibility (only from right neighbor)?
- [ ] Competing claims priority correct?
- [ ] Draw game handling correct?
- [ ] Any other special rules?

See **SPEC_REVIEW.md Section 3** for full details on each rule.

### Scope & Technology (NICE TO CONFIRM)
- [ ] Ephemeral rooms acceptable (no persistent database)?
- [ ] Always exactly 4 players per game?
- [ ] GitHub Pages + Cloudflare hosting acceptable?
- [ ] Lightweight security (room code + session ID) acceptable?

### Configuration & Extensions
- [ ] Should rules be configurable?
- [ ] Preferred tile graphics style?
- [ ] Should scores be persistent?

See **SPEC_REVIEW.md Section 8** for the full checklist.

---

## 📋 Document Sizes and Reading Time

| Document | Size | Read Time | Purpose |
|----------|------|-----------|---------|
| **PROJECT_STATUS.md** | 12 KB | 10 min | **← START HERE** Current stage status |
| START_HERE.md | 5 KB | 5 min | Orientation guide |
| README.md | 11 KB | 5 min | Project overview, quick links |
| SPEC_SUMMARY.txt | 8 KB | 10 min | Visual summary, quick facts |
| REQUIREMENTS.md | 15 KB | 20 min | Functional/non-functional requirements |
| DESIGN.md | 23 KB | 30 min | Architecture and design |
| TASKS.md | 23 KB | 20 min | Implementation roadmap (8 stages) |
| SPEC_REVIEW.md | 16 KB | 30 min | Critical decisions and open questions |
| PROJECT_STRUCTURE.md | 15 KB | 20 min | Directory layout and conventions |
| **TEST_RESULTS_FINAL.md** | 12 KB | 15 min | **← NEW** Stage 0 test results |
| **Q1-Q5_IMPLEMENTATION_VERIFICATION.md** | 18 KB | 20 min | **← NEW** Stage 0 source code audit |

**Total**: ~130 KB of documentation, ~2.5 hours of reading (can be skipped/skimmed by role).

---

## ⚡ Key Facts at a Glance

### Technology
- **Frontend**: TypeScript + vanilla JavaScript + CSS on GitHub Pages
- **Backend**: Cloudflare Workers + Durable Objects
- **Communication**: WebSocket (JSON messages)
- **Database**: None (rooms are ephemeral)
- **Cost**: Free tier of Cloudflare + GitHub

### Architecture
- **Three-layer**: Frontend (SPA) → Backend (Workers) → Game State (Durable Objects)
- **Server authority**: All game logic on server; frontend is a "dumb terminal"
- **Real-time sync**: WebSocket broadcasts state to all 4 players in < 500 ms
- **No cheating**: Player can't see opponent's tiles or modify game state locally

### Game
- **4 players**: Exactly 4 per room (East, South, West, North)
- **144 tiles**: Standard Hong Kong Mahjong set
- **Win condition**: 4 melds + 1 pair (minimum 1 fan)
- **Settlement**: Automatic fan calculation and payout calculation
- **Draw game**: All-pass when wall exhausted

### Implementation
- **8 stages**: 13–18 days total effort
- **Critical path**: Rules engine → Game state → WebSocket multiplayer
- **MVP first**: Focus on one round per room, no persistence
- **Parallelizable**: UI can be built alongside rules engine

---

## 🎯 Success Criteria (When You're Done)

✅ Four players can join a room from different browsers.  
✅ All players see the same game state in real-time.  
✅ Game plays to completion (winner determined or all-pass).  
✅ Winning hand is validated correctly.  
✅ Fan calculation is accurate.  
✅ Settlement is calculated and displayed.  
✅ Disconnected player can reconnect within 5 minutes.  
✅ UI is usable on mobile phones.  
✅ No server setup required by players.  
✅ No cheating possible (all logic server-side).

---

## ❓ Common Questions

**Q: Do we need a database?**  
A: No. Rooms are ephemeral; state is lost when the room ends. If you want persistent scores/leaderboards, add a database in the future.

**Q: Can players use different devices?**  
A: Yes. The frontend runs in any modern browser (mobile, tablet, desktop). No app installation needed.

**Q: How many concurrent games can we support?**  
A: Cloudflare free tier easily supports 100+ concurrent rooms. Each room is a separate Durable Object.

**Q: What if a player disconnects?**  
A: Their seat is reserved for 5 minutes. If they reconnect, they rejoin the game in progress. After 5 minutes, they're removed.

**Q: How secure is the game?**  
A: Players cannot cheat (all moves validated server-side). But it's not suitable for real-money wagering (no user accounts, lightweight session IDs). Perfect for casual group play.

**Q: Can we change the rules later?**  
A: Yes. Fan values and other rules are configurable in a rules config file. Change the file and redeploy.

**Q: How do I deploy this?**  
A: See DEPLOYMENT.md (to be written) or DESIGN.md Section 9. Summary: GitHub Pages for frontend, Wrangler CLI for backend.

---

## 🔗 Navigation

- **Back to overview**: [README.md](README.md)
- **Back to summary**: [SPEC_SUMMARY.txt](SPEC_SUMMARY.txt)
- **Full requirements**: [REQUIREMENTS.md](REQUIREMENTS.md)
- **Architecture details**: [DESIGN.md](DESIGN.md)
- **Implementation plan**: [TASKS.md](TASKS.md)
- **Critical decisions**: [SPEC_REVIEW.md](SPEC_REVIEW.md)
- **File structure**: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

---

## 📞 Next Steps

1. **You are here**: Reading START_HERE.md ✅
2. **Read PROJECT_STATUS.md** to understand current stage (Stage 0 complete) ← DO THIS FIRST
3. **Read the relevant documents** for your role (see Quick Start section above)
4. **For Stage 0 specifics**: Review TEST_RESULTS_FINAL.md and Q1-Q5_IMPLEMENTATION_VERIFICATION.md
5. **For Stage 1 planning**: Read TASKS.md Section "Stage 1: Tile Model & Hand Validation"
6. **Begin Stage 1 implementation** when ready (see TASKS.md)

---

## 📝 Current Project State

| Item | Status |
|------|--------|
| **Stage 0: Payment Calculator** | ✅ Complete (85/85 tests passing) |
| **Stage 1-2: Rules & Game State** | 🔄 Ready to Begin |
| **Stage 3-8: UI & Multiplayer** | ⏳ Pending |
| **Overall Completion** | ~10% (1 of 8 stages) |
| **Next Focus** | Stage 1: Tile Model & Hand Validation |

See [PROJECT_STATUS.md](PROJECT_STATUS.md) for full details.

---

## 📝 Document Versions

All specification documents are version 1.0 and ready for review.

Once you confirm the game rules and answer open questions, implementation can begin.

---

**Ready to dive in?**  
→ Go to [PROJECT_STATUS.md](PROJECT_STATUS.md) for current stage details. ← **START HERE**  
→ Then read [README.md](README.md) for a 5-minute overview.  
→ Then read [SPEC_REVIEW.md](SPEC_REVIEW.md) to confirm the rules.

Good luck! 🀄
