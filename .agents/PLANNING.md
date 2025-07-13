# 🚀 RocketPay Architectural Plan

**Objective:** Refactor the MVP into a robust, scalable, and secure application suitable for production use.

---

### 1. Target Architecture: Service-Oriented & Event-Driven

The current monolith (`index.js`, `validation.js`) will be refactored into a service-oriented architecture. This will improve maintainability, separation of concerns, and scalability.

- **`services/` Directory:** All core business logic will be moved into distinct modules within a new `services/` directory.
  - **`whatsapp.service.js`**: Manages all interactions with the Meta/WhatsApp API (sending messages, images, etc.).
  - **`stellar.service.js`**: Handles all interactions with the Stellar network (creating payment URIs, streaming transactions).
  - **`payment.service.js`**: Manages the lifecycle of a payment, including creating, tracking, and confirming orders.

- **Event-Driven Validation:** Polling for payments with `setInterval` is inefficient. We will switch to a real-time, event-driven model.
  - **Stellar Streaming API:** The `validation.js` worker will be replaced with a listener that uses the Stellar SDK's `.stream()` method. This provides instant payment notifications and is highly efficient.

- **Persistent State Management:** In-memory variables for pending payments are fragile and will be replaced.
  - **Database:** A simple, file-based database (like **SQLite**) will be introduced to persist the state of all payment orders. This ensures data integrity across server restarts and allows different processes to share state safely.

### 2. Development Workflow

- **Task-Based Commits:** Each task in `.agents/TASKS.md` will be implemented in a separate, atomic commit.
- **Documentation Update:** The `README.md` will be updated upon completion of the refactor to reflect the new architecture and setup instructions.
- **Rule Adherence:** All new code will adhere to the principles laid out in `.agents/RULES.md`.

### 3. Project Simplification (Completed)

- **Objective:** Organize and simplify the project structure to improve clarity and maintainability.
- **`scripts/` Directory:** Consolidate all tunnel-related scripts into a single, robust `scripts/tunnel.js`. This will remove redundancy and simplify the development setup.
- **`workers/` Directory:** Removed as part of process consolidation.
- **Configuration:** Updated `package.json` with a new `tunnel` script and modified `.gitignore` to exclude temporary files like `lt_url.txt`.
- **Documentation:** The `README.md` and `.agents/` files have been updated to align with the new, cleaner project structure.

### 4. Process Consolidation (Completed)

- **Objective:** Consolidate the dual-process architecture into a single, streamlined process.
- **Payment Monitor Service:** Extracted payment validation logic into `src/services/payment-monitor.service.ts`.
- **Integration:** Integrated payment monitoring service into `src/index.ts`.
- **Worker Removal:** Removed `src/workers/payment-validator.ts` and the `src/workers/` directory.
- **Package Scripts:** Updated `package.json` to remove `validator` and `validator:dev` scripts.
- **Development Workflow:** Updated `README.md` to reflect the single-command development workflow.

### 5. Enhanced Monitoring & Debugging (Completed)

- **Comprehensive Logging:** Added startup validation, heartbeat logging, and detailed payment processing logs to `src/services/payment-monitor.service.ts`.
- **Connection Testing:** Implemented Stellar connection testing and environment variable validation in `src/services/payment-monitor.service.ts`.
- **Payment Flow Logging:** Improved logging for pending payment creation, total count, and expiration in `src/services/payment.service.ts`.

### 6. Configuration & Documentation (In Progress)

- **Environment Variables Documentation:** Updated `README.md` to document required environment variables.
- **Agent Documentation:** Updated `.agents/PLANNING.md` and `.agents/TASKS.md` to reflect the new architecture and completed tasks.
- **Context Documentation:** Will be updated automatically by repomix.