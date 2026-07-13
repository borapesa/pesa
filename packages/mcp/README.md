# @borapesa/mcp

Model Context Protocol (MCP) server for [Bora Pesa](https://borapesa.dev), the unified open-source payments SDK for Tanzania.

Point your AI coding agent at this server and it can search the full Bora Pesa documentation, compare payment providers, inspect config fields, and pull copy-paste-ready integration examples while it writes your payment code.

## What the agent gets

| Tool             | What it does                                                                 |
| ---------------- | ---------------------------------------------------------------------------- |
| `search_docs`    | Keyword search across all guides and API reference pages                      |
| `get_doc`        | Read any docs page as markdown                                                |
| `list_docs`      | Browse every available page                                                   |
| `list_providers` | Compare Selcom, AzamPay, ClickPesa, Snippe, and the Bogus test provider       |
| `get_provider`   | Full config fields, capabilities, and webhook notes for one provider          |
| `get_example`    | Runnable TypeScript for quickstart, webhooks, events, disbursement, and more  |

Every docs page is also exposed as an MCP resource (`borapesa://docs/<path>`).

The docs snapshot is bundled into the package at build time, so the server works offline and stays versioned with each release.

## Setup

### Claude Code

```bash
claude mcp add borapesa -- npx -y @borapesa/mcp
```

Or add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "borapesa": {
      "command": "npx",
      "args": ["-y", "@borapesa/mcp"]
    }
  }
}
```

### Cursor

Add to `~/.cursor/mcp.json` (or `.cursor/mcp.json` in your project):

```json
{
  "mcpServers": {
    "borapesa": {
      "command": "npx",
      "args": ["-y", "@borapesa/mcp"]
    }
  }
}
```

### VS Code (GitHub Copilot)

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "borapesa": {
      "command": "npx",
      "args": ["-y", "@borapesa/mcp"]
    }
  }
}
```

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "borapesa": {
      "command": "npx",
      "args": ["-y", "@borapesa/mcp"]
    }
  }
}
```

## Other ways agents can read the docs

- `https://borapesa.dev/llms.txt`: index of every page, following the llms.txt convention
- `https://borapesa.dev/llms-full.txt`: the entire documentation in one file
- `https://borapesa.dev/llms/<path>/index.md`: any single page as markdown

## Development

```bash
pnpm --filter @borapesa/mcp build   # bundle server + docs snapshot into dist/
pnpm --filter @borapesa/mcp test    # vitest
node packages/mcp/dist/bin.js       # run the server on stdio
```

## License

MIT
