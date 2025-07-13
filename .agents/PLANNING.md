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

### 3. Project Simplification (Current Phase)

- **Objective:** Organize and simplify the project structure to improve clarity and maintainability.
- **`scripts/` Directory:** Consolidate all tunnel-related scripts into a single, robust `scripts/tunnel.js`. This will remove redundancy and simplify the development setup.
- **`workers/` Directory:** Create a dedicated directory for background processes. The `validation.js` script will be moved to `workers/payment-validator.js` to better reflect its role.
- **Configuration:** Update `package.json` with a new `tunnel` script and modify `.gitignore` to exclude temporary files like `lt_url.txt`.
- **Documentation:** The `README.md` and `.agents/` files will be updated to align with the new, cleaner project structure.