# Senior Engineering Hackathon — Submission

This document covers the hackathon deliverables: **Phase 1 (Implementation)** and **Phase 2 (System Design & Architecture)**.

---

## Phase 1 — Code Selection → Chat Context Injection

### What was built

A feature that lets users select a portion of generated code and attach it as explicit context to their next chat message. This makes it easy to say "change/refactor/fix _this exact part_" without manually copying and pasting.

**How it works (two modes):**

The feature supports two selection modes, togglable via the **⚙ Settings** gear icon → **"Auto-attach selection"** switch. The preference is persisted in LocalStorage.

#### Mode 1 — Auto (default)

1. After the AI generates a fragment, the Code tab shows the output with syntax highlighting.
2. The user highlights any range of code in the Code panel.
3. When the user releases the mouse, the selection is **automatically attached** as context.
4. A **context badge** appears above the chat input showing the file name and a preview of the attached code, with a clear (X) button.
5. When the message is sent, the selected snippet is injected into the prompt sent to the LLM, wrapped in clear delimiters.
6. After sending, the attached context is automatically cleared.

#### Mode 2 — Right-click menu

1. Toggle the **"Auto-attach selection"** switch **OFF** in the Settings gear.
2. Highlight a range of code in the Code panel.
3. **Right-click** the selection → a context menu appears with two options:
   - **Attach as context** — attaches the selection to the chat input (same badge UX as Auto mode).
   - **Copy selection** — copies the selected text to the clipboard.
4. The rest of the flow (badge, clear, send) is the same as Auto mode.

### How to demo

```
1. npm install && npm run dev
2. Open http://localhost:3000
3. Send a prompt like "Build a React counter app" and wait for the code to generate.
4. In the Code tab (right panel), highlight a portion of the generated code.

Auto mode (default):
5a. Release the mouse → selection is automatically attached.

Menu mode:
5b. Click the ⚙ gear → turn OFF "Auto-attach selection".
5c. Highlight code → right-click → choose "Attach as context".

6. In the chat input, notice the context badge showing the file name and snippet preview.
7. Type a follow-up like "Make this use useReducer instead" and send.
8. The LLM receives your message with the selected code as explicit context.
9. You can click X on the badge to clear the selection before sending.
```

### Running tests

```
npm test
```

Tests cover the helper functions in `lib/selection-context.ts`: formatting, truncation, size limits, and edge cases.

### Known limitations

- Selection is text-based (no line numbers or range metadata) because the code viewer uses Prism.js `<pre>` rendering.
- Maximum selection size is ~16 KB. Larger selections are rejected with a toast notification.
- The context is attached to the next message only (one-shot). If you want to reference the same selection again, re-select.
- Multi-file selection is not supported — only the currently active file tab in the Code panel.

---

## Phase 2 — System Design & Architecture

### Miro board

**Architecture diagram**: [Fragments Phase 2 Production Architecture (MERN-friendly)](https://miro.com/welcomeonboard/TDU2RGNtYk5US0p1bGdRMExjV1dLQ0Z1N0VybmFLZXJDSU9xV2JUQnFMZFRSVUJOMHpsdHZlbTkxNEJmLzRQVnR2L0xOYmZ4RVU4clFJS1R6S2RWbTBFU2t4d000MnhwK0U4ODhuWTJBYkdJblIrV3krcVZ6dy9wQVBJNjRpL0JzVXVvMm53MW9OWFg5bkJoVXZxdFhRPT0hdjE=?share_link_id=834979304189)

The board covers all Phase 2 requirements:

- **High-level system architecture** (MERN stack: MongoDB, Express, React, Node.js)
- **Scalability** (1,000 users → 10K+ evolution strategy)
- **Bottlenecks and mitigation strategy** (LLM rate limits, sandbox concurrency, DB hot paths)
- **Reliability and fault tolerance** (retries, circuit breakers, graceful degradation)
- **LLM cost optimization** (model routing, semantic caching, budgets/quotas)
- **Monitoring and observability** (OpenTelemetry, logs, metrics, traces, alerting)
- **CI/CD pipeline and deployment strategy** (environments, migrations, rollbacks)
- **Security and multi-tenancy** (teamId isolation, RBAC, encryption, audit logs)
- **Go-live plan and rough cost drivers** (phased rollout, LLM tokens, compute, infrastructure)
