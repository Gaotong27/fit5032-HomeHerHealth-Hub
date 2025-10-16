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

// ✅ v2 全局配置从 v2/options 引入
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
 * A) 监听 RTDB 报名变化 -> 统计人数 -> 回写 Firestore（registrations & remaining）
 * 路径：/registrations/{eventId}/{uid}
 */
exports.syncRemainingOnRegChange = onValueWritten(
    {ref: "registrations/{eventId}/{uid}"},
    async (event) => {
      const eventId = event.params.eventId;

      // 1) 统计该活动所有报名数
      const regsSnap = await admin
          .database()
          .ref(`registrations/${eventId}`)
          .get();
      const registrations = regsSnap.exists() ?
      Object.keys(regsSnap.val()).length :
      0;

      // 2) 取 Firestore 里的 capacity
      const evRef = db.collection("events").doc(eventId);
      const evSnap = await evRef.get();
      if (!evSnap.exists) {
        console.log(`Event ${eventId} does not exist in Firestore.`);
        return;
      }
      const {capacity = 0} = evSnap.data();

      // 3) 计算剩余名额并写回
      const remaining = Math.max(0, Number(capacity) - Number(registrations));
      await evRef.update({registrations, remaining});

      console.log(
          `RTDB ${eventId}: reg=${registrations}, rem=${remaining}`,
      );
    },
);

/**
 * B) （可选）保留 Firestore 文档写入触发器：当你在控制台/后台改了 capacity 等字段时，也能同步 remaining
 */
exports.updateRemainingSlots = onDocumentWritten(
    {document: "events/{eventId}"},
    async (event) => {
      const eventId = event.params.eventId;

      // after 可能为 null（删除），要判空
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
      console.log(`✅ [FS] ${eventId} -> remaining=${remaining}`);
    },
);
