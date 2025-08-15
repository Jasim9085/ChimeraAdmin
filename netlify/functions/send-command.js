const admin = require("firebase-admin");

let isFirebaseInitialized = false;

try {
  if (admin.apps.length === 0) {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountString) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set or empty.");
    }
    const serviceAccount = JSON.parse(serviceAccountString);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized successfully.");
    isFirebaseInitialized = true;
  } else {
    isFirebaseInitialized = true;
  }
} catch (error) {
  console.error("CRITICAL: Firebase Admin SDK initialization failed.", error);
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  if (!isFirebaseInitialized) {
    console.error("Handler invoked but Firebase is not initialized. Check initialization logs.");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Firebase Admin SDK not initialized on server." })
    };
  }

  try {
    const { token, action, ...data } = JSON.parse(event.body);
    if (!token || !action) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing token or action" }) };
    }

    const message = {
      token: token,
      data: { action, ...data },
      android: { priority: "high" },
    };

    const response = await admin.messaging().send(message);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, messageId: response }),
    };

  } catch (error) {
    console.error("Error sending FCM message:", error.code, error.message);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to send command", details: error.message }),
    };
  }
};
