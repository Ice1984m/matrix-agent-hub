# AI Matrix multi-model provider bridge (prototype)

A small, dependency-free Node.js adapter for server-side calls to Anthropic Claude and Google Gemini.

## Endpoints when integrated into the authenticated AI Matrix API

- `GET /v1/ai/providers`: reports configured providers and model IDs, never credentials.
- `POST /v1/ai/chat`: accepts `{"provider":"claude|gemini","prompt":"...","system":"..."}`.

## Configuration

Set keys only in the server's secret manager or process environment:

- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- Optional `ANTHROPIC_MODEL`, `GEMINI_MODEL`

No key is returned by the registry or embedded in Android, source code, logs, or GitHub.

## Run tests

Node.js 20+:

```sh
node --test
```

Tests use stubbed fetch responses. They do not make billable provider requests.

## Safety and limitations

- The caller must authenticate to the parent API before a provider call.
- Prompt length is bounded; network requests time out.
- This prototype does not enable autonomous tool execution, shell access, code deployment, or device control.
- Provider requests may incur charges. There is no automatic provider fallback.
- Review current provider documentation and model availability before deployment.
- Retrieved model output is untrusted content and must not be executed as code without review.

Official references:
- https://platform.claude.com/docs/en/api/overview
- https://ai.google.dev/gemini-api/docs/get-started
