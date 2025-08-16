import { getStore } from "@netlify/blobs";

export default async () => {
    try {
        const deviceStore = getStore("chimera-devices");
        const { blobs } = await deviceStore.list();
        
        const devices = await Promise.all(
            blobs.map(async (blob) => {
                const data = await deviceStore.get(blob.key, { type: "json" });
                return { deviceId: blob.key, deviceName: data.deviceName };
            })
        );

        return new Response(JSON.stringify(devices), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Failed to fetch devices:', error);
        return new Response('Failed to fetch devices.', { status: 500 });
    }
};
