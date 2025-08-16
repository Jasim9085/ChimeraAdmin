const { getStore } = require("@netlify/blobs");
const admin = require("firebase-admin");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
    });
}

exports.handler = async (event) => {
    try {
        const { siteID, token } = { siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_API_TOKEN };
        if (!siteID || !token) throw new Error("Missing Netlify environment variables.");

        const { deviceId } = JSON.parse(event.body);
        const deviceStore = getStore("chimera-devices", { siteID, token });
        const deviceData = await deviceStore.get(deviceId, { type: "json" });

        if (!deviceData) return { statusCode: 404, body: 'Device not found.' };

        const message = { data: { action: 'deactivate' }, token: deviceData.fcmToken };
        await admin.messaging().send(message);
        return { statusCode: 200, body: `Deactivation signal sent to ${deviceData.deviceName}.` };
    } catch (error) {
        console.error('Error sending deactivation signal:', error);
        return { statusCode: 500, body: 'Error sending deactivation signal.' };
    }
};
