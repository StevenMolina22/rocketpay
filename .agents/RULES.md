# 📋 RocketPay Project Rules

**Last Updated:** 2025-07-13

---

### 1. Code & Architecture

- **Rule 1.1:** All business logic MUST be placed in a corresponding module within the `services/` directory. The `index.js` file should only act as a web server and controller.
- **Rule 1.2:** State (like pending payments) MUST NOT be stored in-memory. All state must be persisted in the designated database (e.g., SQLite).
- **Rule 1.3:** Asynchronous operations MUST use `async/await`. Polling (`setInterval`) is forbidden for event-driven tasks like payment validation.
- **Rule 1.4:** The entire codebase MUST use a consistent module system (CommonJS: `require`/`module.exports`).

### 2. Security

- **Rule 2.1:** No secrets (API keys, tokens) are to be hardcoded in the source code. They MUST be loaded from environment variables.
- **Rule 2.2:** Every payment request MUST generate a cryptographically secure, unique memo to prevent transaction collisions.

### 3. Dependencies

- **Rule 3.1:** Before adding a new dependency, check if existing libraries can fulfill the requirement.
- **Rule 3.2:** All dependencies must be reviewed to avoid duplicates (e.g., `@stellar/stellar-sdk` vs. `stellar-sdk`).

---

*These rules are mandatory. Any new code or modifications must adhere to them.*