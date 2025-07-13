# ✅ RocketPay Refactoring Tasks

**Date Started:** 2025-07-13

---

### Phase 1: Codebase Restructuring

- [x] **Task 1.1:** Create the `services/` directory.
- [x] **Task 1.2:** Create `services/whatsapp.service.js` and move all WhatsApp API interaction logic from `index.js` into it.
- [x] **Task 1.3:** Create `services/stellar.service.js` and move Stellar-related functions (payment URI generation) into it.
- [x] **Task 1.4:** Create `services/payment.service.js` to handle the logic for creating and managing payment states (replacing the in-memory `pendingPayments` Map).
- [x] **Task 1.5:** Refactor `index.js` to act as a controller that calls the new services.

### Phase 2: Real-Time Payment Validation

- [x] **Task 2.1:** Update `validation.js` to use the Stellar SDK's `.stream()` method instead of polling with `setInterval`.
- [x] **Task 2.2:** Ensure the new streaming service correctly identifies and validates payments based on unique memos.
- [x] **Task 2.3:** Integrate the validation service with `payment.service.js` to update payment statuses.

### Phase 3: Security & Best Practices

- [x] **Task 3.1:** Move the hardcoded `VERIFY_TOKEN` from `index.js` to the `.env.example` and load it via `process.env`.
- [x] **Task 3.2:** Implement a mechanism to generate a unique memo for each payment request.
- [x] **Task 3.3:** Remove the duplicate `stellar-sdk` dependency from `package.json` and run `npm install`.
- [x] **Task 3.4:** Standardize the module system across the project (e.g., convert `validation.js` to use CommonJS).

### Phase 4: Documentation

- [x] **Task 4.1:** Update `README.md` with new setup instructions if the database or environment variables change.
- [x] **Task 4.2:** Mark all tasks in this file as complete.

### Phase 5: Project Simplification

- [ ] **Task 5.1:** Create the `scripts/` directory.
- [ ] **Task 5.2:** Consolidate tunnel scripts into a single `scripts/tunnel.js`.
- [ ] **Task 5.3:** Delete the old tunnel scripts (`get_current_url.js`, `get_url.js`, `simple_tunnel.js`, `stable_tunnel.js`, `start_tunnel.js`).
- [ ] **Task 5.4:** Create the `workers/` directory.
- [ ] **Task 5.5:** Move `validation.js` to `workers/payment-validator.js`.
- [ ] **Task 5.6:** Add `lt_url.txt` to `.gitignore`.
- [ ] **Task 5.7:** Add a `tunnel` script to `package.json`.
- [ ] **Task 5.8:** Update `README.md` with the new project structure and commands.
- [ ] **Task 5.9:** Update `.agents/` files to reflect the new project structure.