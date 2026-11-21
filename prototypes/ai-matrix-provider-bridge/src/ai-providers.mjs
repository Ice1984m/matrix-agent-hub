const PROVIDERS = {
  claude: {
    name: "Anthropic Claude",
    keyName: "ANTHROPIC_API_KEY",
    modelName: "ANTHROPIC_MODEL",
    defaultModel: "claude-sonnet-5-5",
    endpoint: "https://api.anthropic.com/v1/messages"
  },
  gemini: {
    name: "Google Gemini",
    keyName: "GEMINI_API_KEY",
    modelName: "GEMINI_MODEL",
    defaultModel: "gemini-3.8-flash",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/interactions"
  }
};

function extractText(provider, payload) {
  if (provider === "claude") {
    return (payload.content || []).filter((part) => part.type === "text").map((part) => part.text).join("\n");
  }
  return (payload.steps || []).filter((step) => step.type === "model_output")
    .flatMap((step) => step.content || [])
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n");
}

export function listAiProviders(env = process.env) {
  return {
    status: "provider_registry",
    providers: Object.entries(PROVIDERS).map(([id, config]) => ({
      id,
      name: config.name,
      configured: Boolean(env[config.keyName]),
      model: env[config.modelName] || config.defaultModel,
      transport: "server-side HTTPS",
      keyExposure: "never returned"
    }))
  };
}

export async function generateAiResponse({ provider, prompt, system } = {}, {
  env = process.env,
  fetchImpl = fetch,
  timeoutMs = 30000
} = {}) {
  const config = PROVIDERS[provider];
  if (!config) throw Object.assign(new Error("Unsupported AI provider. Choose claude or gemini."), { statusCode: 400 });
  const apiKey = env[config.keyName];
  if (!apiKey) throw Object.assign(new Error(`${config.name} is not configured on the server.`), { statusCode: 503 });
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 12000) {
    throw Object.assign(new Error("prompt must contain 1-12000 characters."), { statusCode: 400 });
  }
  if (system !== undefined && (typeof system !== "string" || system.length > 2000)) {
    throw Object.assign(new Error("system must be a string of at most 2000 characters."), { statusCode: 400 });
  }

  const model = env[config.modelName] || config.defaultModel;
  const headers = { "content-type": "application/json" };
  let body;
  if (provider === "claude") {
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2026-10-21";
    body = { model, max_tokens: 2048, ...(system ? { system } : {}), messages: [{ role: "user", content: prompt }] };
  } else {
    headers["x-goog-api-key"] = apiKey;
    body = { model, input: system ? `${system}\n\nUser request:\n${prompt}` : prompt };
  }

  let response;
  try {
    response = await fetchImpl(config.endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs)
    });
  } catch (error) {
    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      throw Object.assign(new Error(`${config.name} request timed out.`), { statusCode: 504 });
    }
    throw Object.assign(new Error(`${config.name} network request failed.`), { statusCode: 502 });
  }

  let payload;
  try { payload = await response.json(); }
  catch { throw Object.assign(new Error(`${config.name} returned an invalid response.`), { statusCode: 502 }); }
  if (!response.ok) {
    throw Object.assign(new Error(`${config.name} request rejected (HTTP ${response.status}). Check provider account, model access, and usage limits.`), {
      statusCode: response.status === 429 ? 429 : 502
    });
  }
  const text = extractText(provider, payload);
  if (!text) throw Object.assign(new Error(`${config.name} returned no text output.`), { statusCode: 502 });
  return { status: "completed", provider, model: payload.model || model, text, usage: payload.usage || null,
    requestId: response.headers?.get?.("request-id") || null };
}
