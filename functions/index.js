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
