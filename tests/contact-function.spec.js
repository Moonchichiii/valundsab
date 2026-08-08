import { expect, test } from "@playwright/test";

import {
  handleContact,
  isSameOrigin,
  normalise,
  validate,
} from "../functions/api/contact.js";

const ENDPOINT = "http://127.0.0.1:8000/api/contact";

const VALID = {
  name: "Anna Andersson",
  email: "anna@example.com",
  company: "Exempel AB",
  subject: "produkterna",
  message: "Hej, jag undrar en sak om SkogsKvitto.",
};

function post(fields, { headers = {}, body } = {}) {
  const payload = body ?? new URLSearchParams(fields).toString();

  return new Request(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      origin: "http://127.0.0.1:8000",
      "sec-fetch-site": "same-origin",
      "cf-connecting-ip": Math.random().toString(36).slice(2),
      ...headers,
    },
    body: payload,
  });
}

test.describe("contact endpoint contract", () => {
  test("only POST is accepted", async () => {
    for (const method of ["GET", "PUT", "PATCH", "DELETE"]) {
      const response = await handleContact(
        new Request(ENDPOINT, { method }),
        {},
      );
      expect(response.status, method).toBe(405);
      expect(response.headers.get("allow"), method).toBe("POST");
    }
  });

  test("cross-origin submissions are refused", async () => {
    const foreign = await handleContact(
      post(VALID, { headers: { origin: "https://example.org" } }),
      {},
    );
    expect(foreign.status).toBe(403);

    const embedded = await handleContact(
      post(VALID, { headers: { "sec-fetch-site": "cross-site" } }),
      {},
    );
    expect(embedded.status).toBe(403);
  });

  test("only urlencoded bodies are accepted", async () => {
    const response = await handleContact(
      post(VALID, { headers: { "content-type": "application/json" } }),
      {},
    );
    expect(response.status).toBe(415);
  });

  test("oversized bodies are refused", async () => {
    const response = await handleContact(
      post(null, {
        body: "message=" + "a".repeat(17 * 1024),
        headers: { "content-length": String(17 * 1024) },
      }),
      {},
    );
    expect(response.status).toBe(413);
  });

  test("incomplete or malformed submissions are refused", async () => {
    const cases = [
      { ...VALID, name: "" },
      { ...VALID, email: "" },
      { ...VALID, message: "" },
      { ...VALID, email: "inte-en-adress" },
      { ...VALID, subject: "nagot-annat" },
      { ...VALID, message: "a".repeat(4001) },
    ];

    for (const fields of cases) {
      const response = await handleContact(post(fields), {
        CONTACT_FORM_ENABLED: "true",
      });
      expect(response.status, JSON.stringify(fields).slice(0, 60)).toBe(400);
    }
  });

  test("a filled honeypot is accepted silently and never delivered", async () => {
    let delivered = false;
    globalThis.fetch = async () => {
      delivered = true;
      return new Response("{}", { status: 200 });
    };

    const response = await handleContact(post({ ...VALID, website: "spam" }), {
      CONTACT_FORM_ENABLED: "true",
      CLOUDFLARE_ACCOUNT_ID: "test",
      CONTACT_EMAIL_TOKEN: "test",
      CONTACT_SENDER_ADDRESS: "webb@valundsab.se",
    });

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain("/kontakt/tack/");
    expect(delivered, "fallan far aldrig leverera").toBe(false);
  });

  test("repeated submissions from one client are throttled", async () => {
    const client = "203.0.113.7";
    const statuses = [];

    for (let attempt = 0; attempt < 7; attempt += 1) {
      const response = await handleContact(
        post(VALID, { headers: { "cf-connecting-ip": client } }),
        {},
      );
      statuses.push(response.status);
    }

    expect(statuses.filter((status) => status === 429).length).toBeGreaterThan(
      0,
    );
  });

  test("delivery stays disabled until it is switched on", async () => {
    const response = await handleContact(post(VALID), {});
    expect(response.status).toBe(503);
    expect(await response.text()).toContain("kontakt@valunds.se");
  });

  test("an enabled submission redirects to the confirmation view", async () => {
    let sent;
    globalThis.fetch = async (url, options) => {
      sent = { url: String(url), options };
      return new Response('{"success":true}', { status: 200 });
    };

    const response = await handleContact(post(VALID), {
      CONTACT_FORM_ENABLED: "true",
      CLOUDFLARE_ACCOUNT_ID: "account",
      CONTACT_EMAIL_TOKEN: "token",
      CONTACT_SENDER_ADDRESS: "webb@valundsab.se",
    });

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "http://127.0.0.1:8000/kontakt/tack/",
    );
    expect(sent.url).toContain("/email/sending/send");
    expect(sent.options.headers.Authorization).toBe("Bearer token");
    const payload = JSON.parse(sent.options.body);
    expect(payload.from).toEqual({
      address: "webb@valundsab.se",
      name: "Valunds webbplats",
    });
    expect(payload.to).toBe("kontakt@valunds.se");
    expect(payload.reply_to).toBe(VALID.email);
    expect(payload.text).toContain(VALID.message);
    expect(payload.content).toBeUndefined();
  });

  test("a sending service rejection never reports success", async () => {
    globalThis.fetch = async () =>
      new Response('{"success":false,"errors":[{"code":1001}]}', {
        status: 200,
      });

    const response = await handleContact(post(VALID), {
      CONTACT_FORM_ENABLED: "true",
      CLOUDFLARE_ACCOUNT_ID: "account",
      CONTACT_EMAIL_TOKEN: "token",
      CONTACT_SENDER_ADDRESS: "webb@valundsab.se",
    });

    expect(response.status).toBe(502);
    expect(await response.text()).toContain("kontakt@valunds.se");
  });

  test("an unreachable sending service never reports success", async () => {
    globalThis.fetch = async () => {
      throw new TypeError("network unreachable");
    };

    const response = await handleContact(post(VALID), {
      CONTACT_FORM_ENABLED: "true",
      CLOUDFLARE_ACCOUNT_ID: "account",
      CONTACT_EMAIL_TOKEN: "token",
      CONTACT_SENDER_ADDRESS: "webb@valundsab.se",
    });

    expect(response.status).toBe(502);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  test("a failed delivery never reports success", async () => {
    globalThis.fetch = async () => new Response("nope", { status: 500 });

    const response = await handleContact(post(VALID), {
      CONTACT_FORM_ENABLED: "true",
      CLOUDFLARE_ACCOUNT_ID: "account",
      CONTACT_EMAIL_TOKEN: "token",
      CONTACT_SENDER_ADDRESS: "webb@valundsab.se",
    });

    expect(response.status).toBe(502);
  });

  test("every response carries its own security headers", async () => {
    const response = await handleContact(post(VALID), {});

    expect(response.headers.get("content-security-policy")).toContain(
      "default-src 'none'",
    );
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("x-frame-options")).toBe("DENY");
    expect(response.headers.get("referrer-policy")).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  test("input is normalised before it is used", () => {
    expect(normalise("  hej\r\nvärlden  ")).toBe("hej\nvärlden");
    expect(normalise("rad\u0000ett")).toBe("radett");
    expect(normalise(null)).toBe("");

    const { submission } = validate(
      new URLSearchParams({ ...VALID, name: "  Anna  " }),
    );
    expect(submission.name).toBe("Anna");
  });

  test("a same-origin form post without origin headers is allowed", () => {
    const request = new Request(ENDPOINT, { method: "POST" });
    expect(isSameOrigin(request)).toBe(true);
  });
});
