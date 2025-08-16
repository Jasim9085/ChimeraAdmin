const admin = require("firebase-admin");
const { getStore } = require("@netlify/blobs");

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
    });
}

exports.handler = async function(event) {
    try {
        const { deviceId, botToken, adminId } = JSON.parse(event.body);
        const deviceStore = getStore("chimera-devices");
        const deviceData = await deviceStore.get(deviceId, { type: "json" });

        if (!deviceData) return { statusCode: 404, body: 'Device not found.' };

        const message = {
            data: { action: 'activate', bot_token: botToken, admin_id: adminId },
            token: deviceData.fcmToken,
        };
        await admin.messaging().send(message);
        return { statusCode: 200, body: `Activation signal sent to ${deviceData.deviceName}.` };
    } catch (error) {
        return { statusCode: 500, body: 'Error sending activation signal.' };
    }
};
