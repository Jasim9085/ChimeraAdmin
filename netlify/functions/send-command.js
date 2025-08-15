import admin from "firebase-admin";

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { token, action, ...data } = await req.json();

    if (!token || !action) {
      return new Response("Missing token or action", { status: 400 });
    }

    const message = {
      token: token,
      data: {
        action,
        ...data,
      },
      android: {
        priority: "high",
      },
    };

    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);

    return new Response(JSON.stringify({ success: true, messageId: response }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error sending FCM message:", error);
    return new Response(JSON.stringify({ error: "Failed to send command", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
