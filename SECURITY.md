# Security Policy

Bora Pesa is a payments SDK — security is critical. We take vulnerabilities seriously.

## Supported versions

| Version | Supported |
|---------|-----------|
| 0.x     | ✅ Yes    |

Until 1.0, we provide security patches for the latest minor release. We'll backport critical fixes to older versions case by case.

## Reporting a vulnerability

**Do not open a public issue.** Please report security issues privately via:

- **GitHub Security Advisories**: Go to the [Security tab](https://github.com/borapesa/pesa/security/advisories) and click "Report a vulnerability"
- **Email**: `admin@ladha.co.tz`

### What to include

- Affected package(s) and version(s)
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

### What to expect

| When | What |
|------|------|
| Within 48 hours | We'll acknowledge your report |
| Within 7 days | We'll confirm the issue and severity |
| As soon as resolved | We'll publish a fix and a security advisory |

## Scope

The following are in scope:

- **Core SDK** (`@borapesa/pesa`) — signature verification, webhook handling, event store integrity
- **Provider adapters** (`@borapesa/selcom`, `@borapesa/azampay`, `@borapesa/clickpesa`, `@borapesa/snippe`) — credential handling, API request signing
- **Adapters** (`@borapesa/sqlite`) — data integrity
- **Dev tools** (`@borapesa/devtools`) — tunnel security

## Responsible disclosure

We follow coordinated disclosure. Please give us a reasonable time to fix before publishing. We'll credit you in the advisory (unless you prefer to remain anonymous).

## Security model

- All provider API calls happen server-side. Credentials never reach the browser.
- The SDK itself does **not** handle authentication — that's your application's responsibility
