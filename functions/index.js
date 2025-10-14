/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");
const sgMail = require("@sendgrid/mail");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// 设置函数区域
setGlobalOptions({ region: "australia-southeast1" });

// 初始化 SendGrid
sgMail.setApiKey(process.env.FIREBASE_CONFIG?.sendgrid?.key || process.env.SENDGRID_API_KEY || "");

// 邮件发送函数
exports.sendEventEmail = onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const { to, userName, eventTitle, eventDate, eventLocation } = req.body;

    if (!to || !eventTitle || !eventDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const msg = {
      to: to,
      from: "tong.gao027@gmail.com", // 你已验证过的邮箱
      subject: `注册成功：${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color:#4CAF50;">🎉 注册成功！</h2>
          <p>亲爱的 ${userName || "用户"}，</p>
          <p>您已成功报名 <strong>${eventTitle}</strong>。</p>
          <p>🕒 活动时间：${eventDate}</p>
          <p>📍 活动地点：${eventLocation || "待定"}</p>
          <p>感谢您的参与，我们期待见到您！</p>
          <hr/>
          <p style="font-size: 12px; color: #777;">此邮件由系统自动发送，请勿直接回复。</p>
        </div>
      `,
    };

    await sgMail.send(msg);
    return res.status(200).json({ message: "Email sent successfully ✅" });
  } catch (error) {
    logger.error("SendGrid error", error);
    const errMsg = error.response?.body?.errors?.[0]?.message || error.message;
    return res.status(500).json({ error: errMsg });
  }
});