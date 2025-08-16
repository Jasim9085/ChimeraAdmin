const { getStore } = require("@netlify/blobs");
const admin = require("firebase-admin");

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
        });
    } catch (e) {
        console.error("Firebase admin initialization error", e);
    }
}

exports.handler = async (event) => {
    try {
        const { deviceId } = JSON.parse(event.body);
        const deviceStore = getStore("chimera-devices");
        const deviceData = await deviceStore.get(deviceId, { type: "json" });

        if (!deviceData) {
            return { statusCode: 404, body: 'Device not found.' };
        }

        const message = { data: { action: 'deactivate' }, token: deviceData.fcmToken };
        await admin.messaging().send(message);
        return { statusCode: 200, body: `Deactivation signal sent to ${deviceData.deviceName}.` };
    } catch (error) {
        console.error('Error sending deactivation signal:', error);
        return { statusCode: 500, body: 'Error sending deactivation signal.' };
    }
};
