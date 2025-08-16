const { getStore } = require("@netlify/blobs");

exports.handler = async () => {
    try {
        const deviceStore = getStore("chimera-devices");
        const { blobs } = await deviceStore.list();
        
        const devices = await Promise.all(
            blobs.map(async (blob) => {
                const data = await deviceStore.get(blob.key, { type: "json" });
                return { deviceId: blob.key, deviceName: data.deviceName };
            })
        );

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(devices)
        };
    } catch (error) {
        console.error('Failed to fetch devices:', error);
        return { statusCode: 500, body: 'Failed to fetch devices.' };
    }
};
