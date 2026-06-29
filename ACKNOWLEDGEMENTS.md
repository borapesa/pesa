# Acknowledgements

Bora Pesa is built standing on the shoulders of many excellent open-source projects and community resources.

## Architecture & inspiration

- [**better-auth**](https://github.com/better-auth/better-auth) — The factory pattern, plugin pipeline, and monorepo structure draw heavily from better-auth's architecture. Their auto-changeset workflow and release-notes pipeline (adapted from [sst/opencode](https://github.com/anomalyco/opencode), MIT License) informed our CI/CD setup.
- [**sst/opencode**](https://github.com/anomalyco/opencode) (MIT) — better-auth's release-notes pipeline adapts the revert-cancellation algorithm and two-stage AI pipeline from opencode's `raw-changelog.ts` and `changelog.ts`.
- [**Bluesky Social App**](https://github.com/bluesky-social/social-app) — Referenced for release management approaches in large open-source projects.
- [**vercel/next.js**](https://github.com/vercel/next.js) — Referenced for custom release scripting and monorepo conventions.

## Documentation

- [**Fumadocs**](https://fumadocs.dev) — The documentation site is built entirely with Fumadocs (Fumadocs UI, Fumadocs MDX, Fumadocs Core). Page actions, search, and layout components are from the Fumadocs ecosystem.
- [**TypeDoc**](https://typedoc.org) — API reference documentation is generated from JSDoc annotations using TypeDoc with the typedoc-plugin-markdown plugin.
- [**Next.js**](https://nextjs.org) — The documentation site runs on Next.js with static export.

## Styling & UI

- [**Tailwind CSS**](https://tailwindcss.com) — Utility-first CSS framework (v4).
- [**Lucide**](https://lucide.dev) — Icon library.
- [**Radix UI**](https://www.radix-ui.com) — Accessible UI primitives (popover component).
- [**class-variance-authority**](https://cva.style) — Type-safe component variant definitions.
- [**cnfast**](https://www.npmjs.com/package/cnfast) — Class name utility.
- [**@fuma-translate/react**](https://fuma-nama.github.io/fuma-translate) — i18n primitives for Fumadocs components.

## Tooling

- [**Changesets**](https://github.com/changesets/changesets) — Version management and changelog generation across the monorepo. Uses `@changesets/cli`, `@changesets/action`, and `@changesets/changelog-github`.
- [**Turborepo**](https://turbo.build) — Monorepo build orchestration and caching.
- [**pnpm**](https://pnpm.io) — Package manager with workspace support.
- [**Biome**](https://biomejs.dev) — Code formatter and linter.
- [**Lefthook**](https://github.com/evilmartians/lefthook) — Git hooks manager.
- [**Vitest**](https://vitest.dev) — Test runner.
- [**Orama**](https://oramasearch.com) — Full-text search in the documentation site.
- [**better-sqlite3**](https://github.com/WiseLibs/better-sqlite3) — Default SQLite event store adapter.
- [**uuid**](https://github.com/uuidjs/uuid) — UUID generation for transaction IDs and events.
- [**@tailwindcss/postcss**](https://tailwindcss.com) — PostCSS plugin for Tailwind CSS v4 integration.

## Deployment

- [**Cloudflare Pages**](https://pages.cloudflare.com) — Documentation hosting.

## Provider APIs & community SDKs

The provider adapters integrate with the following Tanzanian payment gateways. Community SDKs were referenced to understand provider API contracts and conventions.

- [**AzamPay**](https://azampay.com) — Mobile money, bank checkout, and disbursement APIs.
  - [flexcodelabs/azampay](https://github.com/flexcodelabs/azampay) — Dart/Flutter SDK.
  - [PhilipMuze/AzamPay-Tanzania-Flutter](https://github.com/PhilipMuze/AzamPay-Tanzania-Flutter) — Flutter SDK.
- [**ClickPesa**](https://clickpesa.com) — Multi-channel payment and BillPay APIs.
  - [JAXPARROW/clickpesa-python-sdk](https://github.com/JAXPARROW/clickpesa-python-sdk) — Python SDK.
- [**Selcom**](https://selcom.net) — USSD push, Qwiksend bank payouts, and checkout APIs.
  - [selcompaytechltd/selcom-apigw-client-nodejs](https://github.com/selcompaytechltd/selcom-apigw-client-nodejs) — Official Node.js API client.

## Development

Bora Pesa is co-authored with [Claude Code](https://claude.ai/code) (Anthropic). All AI-assisted commits are attributed with `Co-Authored-By: Claude <noreply@anthropic.com>` per the project's [AI Usage Policy](AI_USAGE_POLICY.md).

---

_This list is maintained by contributors. If you notice a missing acknowledgement, please open a PR._
