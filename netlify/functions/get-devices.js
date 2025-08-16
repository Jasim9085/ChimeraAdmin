const { getStore } = require("@netlify/blobs");

exports.handler = async () => {
    try {
        const { siteID, token } = { siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_API_TOKEN };
        if (!siteID || !token) throw new Error("Missing Netlify environment variables.");

        const deviceStore = getStore("chimera-devices", { siteID, token });
        const { blobs } = await deviceStore.list();
        
        const devices = await Promise.all(
            blobs.map(async (blob) => {
                const data = await deviceStore.get(blob.key, { type: "json" });
                return { deviceId: blob.key, deviceName: data.deviceName };
            })
        );
        return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(devices) };
    } catch (error) {
        console.error('Failed to fetch devices:', error.message);
        if (error.message.includes("404")) { // Handles case where store doesn't exist yet
            return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify([]) };
        }
        return { statusCode: 500, body: 'Failed to fetch devices.' };
    }
};
