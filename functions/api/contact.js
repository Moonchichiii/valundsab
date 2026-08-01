const MAX_BODY_BYTES = 16 * 1024;
const CONFIRMATION_PATH = "/kontakt/tack/";
const CONTACT_ADDRESS = "kontakt@valunds.se";
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;

const SUBJECTS = new Set(["bolaget", "produkterna", "samarbeten"]);

const LIMITS = {
  name: 120,
  email: 200,
  company: 120,
  message: 4000,
};

const SECURITY_HEADERS = {
  "Content-Security-Policy":
    "default-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'none'; style-src 'none'; img-src 'none'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Cache-Control": "no-store",
};

const attempts = new Map();

export function normalise(value) {
  return String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .split("")
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code === 10 || (code > 31 && code !== 127);
    })
    .join("")
    .trim();
}

export function validate(form) {
  const submission = {
    name: normalise(form.get("name")),
    email: normalise(form.get("email")),
    company: normalise(form.get("company")),
    subject: normalise(form.get("subject")),
    message: normalise(form.get("message")),
  };
  const errors = [];

  for (const field of ["name", "email", "message"]) {
    if (submission[field].length === 0) {
      errors.push(field);
    }
  }

  for (const [field, limit] of Object.entries(LIMITS)) {
    if (submission[field].length > limit) {
      errors.push(field);
    }
  }

  if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(submission.email)) {
    errors.push("email");
  }

  if (!SUBJECTS.has(submission.subject)) {
    errors.push("subject");
  }

  return { submission, errors: [...new Set(errors)] };
}

export function isSameOrigin(request) {
  const site = request.headers.get("sec-fetch-site");

  if (site && site !== "same-origin") {
    return false;
  }

  const origin = request.headers.get("origin");

  if (origin && origin !== new URL(request.url).origin) {
    return false;
  }

  return true;
}

export function withinRateLimit(key, now = Date.now()) {
  const window = (attempts.get(key) ?? []).filter(
    (stamp) => now - stamp < RATE_LIMIT_WINDOW_MS,
  );

  if (window.length >= RATE_LIMIT_MAX_REQUESTS) {
    attempts.set(key, window);
    return false;
  }

  window.push(now);
  attempts.set(key, window);
  return true;
}

function respond(status, body, extraHeaders = {}) {
  return new Response(body, {
    status,
    headers: {
      ...SECURITY_HEADERS,
      "Content-Type": "text/plain; charset=utf-8",
      ...extraHeaders,
    },
  });
}

function redirectToConfirmation(request) {
  return respond(303, null, {
    Location: new URL(CONFIRMATION_PATH, request.url).toString(),
  });
}

export async function handleContact(request, env = {}) {
  if (request.method !== "POST") {
    return respond(405, "Method not allowed", { Allow: "POST" });
  }

  if (!isSameOrigin(request)) {
    return respond(403, "Forbidden");
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.startsWith("application/x-www-form-urlencoded")) {
    return respond(415, "Unsupported media type");
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");

  if (declaredLength > MAX_BODY_BYTES) {
    return respond(413, "Payload too large");
  }

  const body = await request.text();

  if (body.length > MAX_BODY_BYTES) {
    return respond(413, "Payload too large");
  }

  const client = request.headers.get("cf-connecting-ip") ?? "unknown";

  if (!withinRateLimit(client)) {
    return respond(429, "Too many requests", { "Retry-After": "60" });
  }

  const form = new URLSearchParams(body);

  if (normalise(form.get("website")).length > 0) {
    return redirectToConfirmation(request);
  }

  const { submission, errors } = validate(form);

  if (errors.length > 0) {
    return respond(400, "Bad request");
  }

  if (env.CONTACT_FORM_ENABLED !== "true") {
    return respond(
      503,
      "Kontaktformuläret är inte aktiverat än. Skriv till " +
        CONTACT_ADDRESS +
        " så svarar vi.",
      { "Retry-After": "3600" },
    );
  }

  const delivered = await deliver(submission, env);

  if (!delivered) {
    return respond(
      502,
      "Meddelandet kunde inte skickas just nu. Skriv till " +
        CONTACT_ADDRESS +
        " så svarar vi.",
    );
  }

  return redirectToConfirmation(request);
}

async function deliver(submission, env) {
  const response = await fetch(
    "https://api.cloudflare.com/client/v4/accounts/" +
      env.CLOUDFLARE_ACCOUNT_ID +
      "/email/sending/send",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + env.CONTACT_EMAIL_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: { email: env.CONTACT_SENDER_ADDRESS, name: "Valunds webbplats" },
        to: [{ email: CONTACT_ADDRESS }],
        reply_to: { email: submission.email, name: submission.name },
        subject: "Webbformulär: " + submission.subject,
        content: [
          {
            type: "text/plain",
            value: [
              "Namn: " + submission.name,
              "E-post: " + submission.email,
              "Företag: " + (submission.company || "-"),
              "Ärende: " + submission.subject,
              "",
              submission.message,
            ].join("\n"),
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    console.error("contact delivery failed with status " + response.status);
    return false;
  }

  return true;
}

export async function onRequest(context) {
  return handleContact(context.request, context.env ?? {});
}
