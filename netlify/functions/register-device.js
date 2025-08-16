import { getStore } from "@netlify/blobs";

export default async (req) => {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }
    try {
        const data = await req.json();
        const { deviceId, deviceName, fcmToken } = data;

        if (!deviceId || !deviceName || !fcmToken) {
            return new Response('Missing required fields.', { status: 400 });
        }

        const deviceStore = getStore("chimera-devices");
        await deviceStore.setJSON(deviceId, { deviceName, fcmToken, registeredAt: new Date().toISOString() });
        return new Response('Device registered successfully.', { status: 200 });
    } catch (error) {
        console.error('Registration failed:', error);
        return new Response('Registration failed.', { status: 500 });
    }
};
