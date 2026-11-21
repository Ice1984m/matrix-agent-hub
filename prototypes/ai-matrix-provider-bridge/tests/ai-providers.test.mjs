import test from "node:test";
import assert from "node:assert/strict";
import { generateAiResponse, listAiProviders } from "../src/ai-providers.mjs";

test("provider registry reveals configuration, never secrets", () => {
  const status = listAiProviders({ ANTHROPIC_API_KEY: "secret", GEMINI_API_KEY: "" });
  assert.equal(status.providers[0].configured, true);
  assert.equal(status.providers[1].configured, false);
  assert.equal(JSON.stringify(status).includes("secret"), false);
});

test("Claude adapter uses Messages API and parses text", async () => {
  let req;
  const result = await generateAiResponse({ provider: "claude", prompt: "Check code", system: "Be concise" }, {
    env: { ANTHROPIC_API_KEY: "test" },
    fetchImpl: async (url, options) => {
      req = { url, options, body: JSON.parse(options.body) };
      return new Response(JSON.stringify({ model: "claude-sonnet-5-5", content: [{ type: "text", text: "OK" }] }), { status: 200 });
    }
  });
  assert.equal(req.url, "https://api.anthropic.com/v1/messages");
  assert.equal(req.options.headers["x-api-key"], "test");
  assert.equal(req.body.messages[0].content, "Check code");
  assert.equal(result.text, "OK");
});

test("Gemini adapter uses Interactions API and parses output", async () => {
  let req;
  const result = await generateAiResponse({ provider: "gemini", prompt: "Explain ADB" }, {
    env: { GEMINI_API_KEY: "test" },
    fetchImpl: async (url, options) => {
      req = { url, options, body: JSON.parse(options.body) };
      return new Response(JSON.stringify({ model: "gemini-3.8-flash", steps: [
        { type: "model_output", content: [{ type: "text", text: "Android Debug Bridge" }] }
      ] }), { status: 200 });
    }
  });
  assert.equal(req.url, "https://generativelanguage.googleapis.com/v1beta/interactions");
  assert.equal(req.options.headers["x-goog-api-key"], "test");
  assert.equal(req.body.input, "Explain ADB");
  assert.equal(result.text, "Android Debug Bridge");
});

test("missing key, invalid provider, invalid prompt and upstream failure fail closed", async () => {
  await assert.rejects(() => generateAiResponse({ provider: "claude", prompt: "x" }, { env: {} }), /not configured/);
  await assert.rejects(() => generateAiResponse({ provider: "other", prompt: "x" }, { env: {} }), /Unsupported/);
  await assert.rejects(() => generateAiResponse({ provider: "gemini", prompt: " " }, { env: { GEMINI_API_KEY: "x" } }), /1-12000/);
  await assert.rejects(() => generateAiResponse({ provider: "gemini", prompt: "x" }, {
    env: { GEMINI_API_KEY: "x" }, fetchImpl: async () => new Response("{}", { status: 403 })
  }), /HTTP 403/);
});
