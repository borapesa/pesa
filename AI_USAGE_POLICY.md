# AI Usage Policy

Bora Pesa is developed and maintained with the assistance of AI tools. This policy defines how we use AI and what we expect from contributors who do the same.

## Our Commitment

- Every line of AI-generated or AI-assisted code is **tested and reviewed by a human maintainer** before it lands in `master`.
- AI is a productivity tool, not an authority. Maintainers remain responsible for correctness, security, and design decisions.
- We never blindly accept AI output. All suggestions are evaluated against the project's design principles, type contracts, and security model.

## Disclosure Requirements

### For maintainers

- AI-assisted commits are tagged with `Co-Authored-By: Claude <noreply@anthropic.com>` or the equivalent for the tool used.

### For contributors

- **AI-assisted pull requests must be disclosed explicitly** in the PR description. Include:
  - The tool(s) used (e.g., Claude, Copilot, ChatGPT)
  - The nature of the assistance (e.g., "generated the boilerplate", "reviewed for edge cases", "wrote the initial implementation")
  - Confirmation that you have personally tested and reviewed every line
- **AI-assisted issues must be disclosed** with a note at the bottom of the issue body.

### Format

```markdown
## AI Assistance Disclosure

- **Tool(s):** Claude Code, Copilot
- **Assistance:** Initial implementation of the Selcom HMAC digest logic. I
  reviewed the signature algorithm against Selcom's docs, added test vectors,
  and verified against the sandbox API.
- **Review:** I have personally tested and reviewed every line in this PR.
```

## Rationale

We believe AI-assisted development is the future, and pretending otherwise helps no one. Transparency builds trust with users, contributors, and the Tanzanian developer community. It also sets a precedent — if you're integrating Bora Pesa into a financial product, you deserve to know how the SDK you depend on is built.

## Questions?

Open an issue or email the maintainers.
