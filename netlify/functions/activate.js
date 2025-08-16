import { getStore } from "@netlify/blobs";
import admin from "firebase-admin";

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
    });
}

export default async (req) => {
    try {
        const { deviceId, botToken, adminId } = await req.json();
        const deviceStore = getStore("chimera-devices");
        const deviceData = await deviceStore.get(deviceId, { type: "json" });

        if (!deviceData) {
            return new Response('Device not found.', { status: 404 });
        }

        const message = {
            data: { action: 'activate', bot_token: botToken, admin_id: adminId },
            token: deviceData.fcmToken,
        };
        await admin.messaging().send(message);
        return new Response(`Activation signal sent to ${deviceData.deviceName}.`, { status: 200 });
    } catch (error) {
        console.error('Error sending activation signal:', error);
        return new Response('Error sending activation signal.', { status: 500 });
    }
};
