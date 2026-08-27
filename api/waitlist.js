/**
 * Waitlist signup, written into Firestore.
 *
 * Firestore's REST API rather than the Firebase JS SDK. The SDK is roughly 100
 * to 200 kB gzipped for what is one POST, and this site already refuses to send
 * a 240 kB 3D chunk to anyone on a slow connection, so shipping that to every
 * visitor for a single form would be inconsistent. Going through a function also
 * keeps the write server-side, so a bot can be turned away before it ever
 * reaches the database.
 *
 * Same Firestore collection either way, so Phase 3 can move to the SDK and real
 * accounts without migrating anything.
 *
 * Needs two environment variables in Vercel:
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_WEB_API_KEY   (the Web API key; safe to hold server-side)
 *
 * And these Firestore rules, which are what actually protect the list. The key
 * on its own must not be enough to read it:
 *
 *   match /waitlist/{doc} {
 *     allow create: if request.resource.data.keys().hasOnly(['email','createdAt','source'])
 *                   && request.resource.data.email is string
 *                   && request.resource.data.email.size() < 200;
 *     allow read, update, delete: if false;
 *   }
 */

const PROJECT = process.env.FIREBASE_PROJECT_ID;
const API_KEY = process.env.FIREBASE_WEB_API_KEY;

// Deliberately permissive. The job here is catching typos, not adjudicating
// RFC 5322; a real address that this rejected would be a lost signup.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("allow", "POST");
    return response.status(405).json({ error: "POST only" });
  }

  if (!PROJECT || !API_KEY) {
    return response.status(503).json({
      error: "not-configured",
      message: "Waitlist storage isn't connected yet.",
    });
  }

  const body = typeof request.body === "string" ? JSON.parse(request.body) : (request.body ?? {});
  const email = String(body.email ?? "").trim().toLowerCase();

  // Honeypot: a field hidden from people, so anything that fills it is a bot.
  // Answer 200 so it can't tell it was caught and retry differently.
  if (body.company) return response.status(200).json({ ok: true });

  if (!EMAIL.test(email) || email.length > 200) {
    return response.status(400).json({ error: "invalid-email" });
  }

  try {
    const url =
      `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/waitlist` +
      `?key=${API_KEY}`;

    const write = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        fields: {
          email: { stringValue: email },
          createdAt: { timestampValue: new Date().toISOString() },
          source: { stringValue: String(body.source ?? "dca-bot").slice(0, 40) },
        },
      }),
    });

    if (!write.ok) {
      const detail = await write.text();
      // Don't leak Firestore's response to the browser; log it for the deploy.
      console.error("firestore write failed", write.status, detail.slice(0, 300));
      return response.status(502).json({ error: "write-failed" });
    }

    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error("waitlist error", error);
    return response.status(502).json({ error: "write-failed" });
  }
}
