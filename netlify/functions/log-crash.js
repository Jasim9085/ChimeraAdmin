import { getStore } from "@netlify/blobs";

export default async (req) => {
    try {
        const { deviceId, deviceName, stackTrace } = await req.json();
        const crashStore = getStore("chimera-crashes");
        const crashId = `${deviceId}-${new Date().toISOString()}`;
        
        await crashStore.setJSON(crashId, { deviceName, stackTrace });
        return new Response('Crash log stored.', { status: 200 });
    } catch (error) {
        console.error('Failed to log crash:', error);
        return new Response('Failed to log crash.', { status: 500 });
    }
};
