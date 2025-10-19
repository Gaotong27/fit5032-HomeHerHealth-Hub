/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

/* ======== Cloud Functions (JS) ======== */
const admin = require("firebase-admin");

const {setGlobalOptions} = require("firebase-functions/v2/options");
const {onDocumentWritten} = require("firebase-functions/v2/firestore");
const {onValueWritten} = require("firebase-functions/v2/database");

setGlobalOptions({
  region: "us-central1",
  maxInstances: 10,
});

admin.initializeApp();
const db = admin.firestore();

/**
 * A) Listen for RTDB registration changes -> count participants ->
 * write the numbers back to Firestore (registrations & remaining).
 * Path: /registrations/{eventId}/{uid}
 */
exports.syncRemainingOnRegChange = onValueWritten(
    {ref: "registrations/{eventId}/{uid}"},
    async (event) => {
      const eventId = event.params.eventId;

      // 1) satisfy registrations from RTDB
      const regsSnap = await admin
          .database()
          .ref(`registrations/${eventId}`)
          .get();
      const registrations = regsSnap.exists() ?
      Object.keys(regsSnap.val()).length :
      0;

      // 2) get capacity from Firestore
      const evRef = db.collection("events").doc(eventId);
      const evSnap = await evRef.get();
      if (!evSnap.exists) {
        console.log(`Event ${eventId} does not exist in Firestore.`);
        return;
      }
      const {capacity = 0} = evSnap.data();

      // 3) update registrations & remaining back to Firestore
      const remaining = Math.max(0, Number(capacity) - Number(registrations));
      await evRef.update({registrations, remaining});

      console.log(
          `RTDB ${eventId}: reg=${registrations}, rem=${remaining}`,
      );
    },
);

/**
 * B) Keep the Firestore document write trigger:
 * when capacity or other fields are modified in the console/backend,
 * the remaining value will also be updated accordingly.
 */
exports.updateRemainingSlots = onDocumentWritten(
    {document: "events/{eventId}"},
    async (event) => {
      const eventId = event.params.eventId;

      // after may be null if the document was deleted
      const afterSnap = event.data && event.data.after;
      if (!afterSnap || !afterSnap.exists) {
        console.log(`Event ${eventId} was deleted.`);
        return;
      }
      const eventData = afterSnap.data() || {};
      const capacity = Number(eventData.capacity || 0);
      const registrations = Number(eventData.registrations || 0);
      const remaining = Math.max(0, capacity - registrations);

      await db.collection("events").doc(eventId).update({remaining});
      console.log(` [FS] ${eventId} -> remaining=${remaining}`);
    },
);

/* ================= Email Notifications (append-only) ================== */

const {defineSecret} = require("firebase-functions/params");
const {onValueCreated} =
  require("firebase-functions/v2/database");
const logger = require("firebase-functions/logger");

const SENDGRID_API_KEY = defineSecret("SENDGRID_API_KEY");
const FROM_EMAIL = defineSecret("FROM_EMAIL");

let sgMail = null;

function getSg() {
  if (!sgMail) {
    sgMail = require("@sendgrid/mail");
  }
  return sgMail;
}

/* ---------- Time helpers (robust across multiple field shapes) ---------- */

/**
 * Try to convert various time shapes into a Date object.
 */
function toDateMaybe(v) {
  try {
    if (!v) return null;
    if (v instanceof Date) return v;
    if (typeof v === "string" || typeof v === "number") {
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof v.toDate === "function") {
      const d = v.toDate();
      return d instanceof Date ? d : null;
    }
    // Firestore Timestamp-like {seconds, nanoseconds}
    if (typeof v.seconds === "number") {
      return new Date(v.seconds * 1000);
    }
    return null;
  } catch (_) {
    return null;
  }
}

/**
 * Format a Date in Australia/Melbourne timezone.
 */
function fmt(d, withTime) {
  try {
    return new Intl.DateTimeFormat("en-AU", {
      dateStyle: "full",
      timeStyle: withTime ? "short" : undefined,
      timeZone: "Australia/Melbourne",
    }).format(d);
  } catch (_) {
    return String(d);
  }
}

/**
 * Build a human-readable "when" string:
 * 1) If startTime/endTime exist → "Thu, 16 Oct 2025, 10:00 AM – 11:30 AM"
 * 2) Else use date (+ optional time) → "Thu, 16 Oct 2025 10:00 AM"
 * 3) If nothing is available → "TBA"
 */
function buildWhen(ev) {
  const s = toDateMaybe(ev.startTime || ev.start || ev.startAt);
  const e = toDateMaybe(ev.endTime || ev.end || ev.endAt);

  if (s) {
    const left = fmt(s, true);
    if (e) return left + " – " + fmt(e, true);
    return left;
  }

  // Fallback: date (string like "2025-10-16") + optional time
  const d = toDateMaybe(ev.date || ev.startDate);
  if (d) {
    const base = fmt(d, false);
    const t = ev.time || ev.start_time || ev.startsAtTime;
    return t ? base + " " + String(t) : base;
  }

  return "TBA";
}

/* ---------------------- mail content (EN) ---------------------- */

/**
 * Build HTML content for "Registration confirmed"
 * Keys used: title, start/end or date/time, location, description
 */
function buildRegistrationHtml(p) {
  const name = p && p.userName ? p.userName : "there";
  const ev = p && p.ev ? p.ev : {};
  const title = ev.title ? ev.title : "Event";
  const when = buildWhen(ev);
  const location = ev.location ? ev.location : "Online / TBC";
  const desc = ev.description ? "<p>" + ev.description + "</p>" : "";

  return [
    "<div style=\"font-family:Arial,Helvetica,sans-serif;",
    "line-height:1.6;color:#222\">",
    "<h2>🎉 Registration Confirmed: " + title + "</h2>",
    "<p>Hi " + name + ",</p>",
    "<p>You have successfully registered for this event. ",
    "Here are the details:</p>",
    "<ul>",
    "<li><b>When:</b> " + when + "</li>",
    "<li><b>Where:</b> " + location + "</li>",
    "</ul>",
    desc,
    "<p>If you need to cancel or make changes, ",
    "please visit the <b>My Registrations</b> page.</p>",
    "<hr/>",
    "<p style=\"font-size:12px;color:#666\">",
    "This is an automated message. Please do not reply.</p>",
    "</div>",
  ].join("");
}

/* ---------------------- Firestore helpers ---------------------- */

/**
 * Read an event document from Firestore by ID
 * Adds { id } to the returned data
 */
async function getEventDoc(eventId) {
  if (!eventId) return null;
  const ref = db.collection("events").doc(eventId);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const data = snap.data() || {};
  data.id = snap.id;
  return data;
}

/**
 * Read a user profile from Firestore (fallback if RTDB lacks fields)
 */
async function getUserProfile(uid) {
  if (!uid) return {};
  try {
    const ref = db.collection("users").doc(uid);
    const snap = await ref.get();
    return snap.exists ? (snap.data() || {}) : {};
  } catch (_) {
    return {};
  }
}

/**
 * Send an HTML email using SendGrid
 * Required fields in p: to, subject, html, secretKey, fromEmail
 */
async function sendHtml(p) {
  const sg = getSg();
  sg.setApiKey(p.secretKey);
  await sg.send({
    to: p.to,
    from: p.fromEmail,
    subject: p.subject,
    html: p.html,
  });
}

/* ------------------- Trigger: registration created ------------------- */

/**
 * Send a "registration confirmed" email
 * Trigger: RTDB create at registrations/{eventId}/{uid}
 */
exports.sendEmailOnRegistrationCreated = onValueCreated(
    {
      ref: "registrations/{eventId}/{uid}",
      secrets: [SENDGRID_API_KEY, FROM_EMAIL],
    },
    /**
 * RTDB change handler (created)
 * Reads RTDB node → loads event → resolves recipient/name →
 * builds HTML → sends email via SendGrid.
*/
    async (event) => {
      const eventId = event.params.eventId;
      const uid = event.params.uid;

      // Predeclare to avoid "no-undef" in catch
      let to = null;
      let userName = "";

      try {
        let v = null;
        if (event.data && typeof event.data.val === "function") {
          v = event.data.val();
        } else if (event.data && event.data.val) {
          v = event.data.val;
        }
        const node = (v && typeof v === "object") ? v : {};

        // Load event details
        const evDoc = await getEventDoc(eventId);
        if (!evDoc) {
          logger.warn("Event not found for email send", {
            eventId: eventId,
          });
          return;
        }

        // Prefer email/name from RTDB; fallback to Firestore users/{uid}
        to = node.userEmail || node.email || "";
        userName = node.userName || node.displayName || "";

        if (!to || !userName) {
          const profile = await getUserProfile(uid);
          if (!to && profile.email) to = profile.email;
          if (!userName) {
            userName = profile.displayName || profile.name || "";
          }
        }

        if (!to) {
          logger.warn("No recipient email for registration", {
            eventId: eventId, uid: uid,
          });
          return;
        }

        const html = buildRegistrationHtml({
          userName: userName,
          ev: evDoc,
        });

        await sendHtml({
          to: to,
          subject: "Registration Confirmed: " +
          (evDoc.title || "Event"),
          html: html,
          secretKey: SENDGRID_API_KEY.value(),
          fromEmail: FROM_EMAIL.value(),
        });

        logger.info("Registration email sent", {
          eventId: eventId, uid: uid, to: to,
        });
      } catch (err) {
        const body = (err && err.response && err.response.body) ?
        err.response.body :
        err;
        const status = (err && err.code) ?
        err.code :
        (err && err.response && err.response.statusCode);

        logger.error("sendEmailOnRegistrationCreated error", {
          eventId: eventId,
          uid: uid || null,
          to: to || null,
          status: status || null,
          from: (FROM_EMAIL && typeof FROM_EMAIL.value === "function") ?
          FROM_EMAIL.value() :
          null,
          sgBody: body,
        });
      }
    },
);

