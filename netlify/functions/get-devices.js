const { getStore } = require("@netlify/blobs");

exports.handler = async () => {
    try {
        const siteID = process.env.NETLIFY_SITE_ID;
        const token = process.env.NETLIFY_API_TOKEN;
        if (!siteID || !token) throw new Error("Netlify environment variables (NETLIFY_SITE_ID, NETLIFY_API_TOKEN) are not set.");

        const deviceStore = getStore({ name: "chimera-devices", siteID, token });
        const { blobs } = await deviceStore.list();
        
        const devices = await Promise.all(
            blobs.map(async (blob) => {
                const data = await deviceStore.get(blob.key, { type: "json" });
                return { deviceId: blob.key, deviceName: data.deviceName };
            })
        );
        return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(devices) };
    } catch (error) {
        if (error.status === 404 || (error.message && error.message.includes("404"))) {
            return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify([]) };
        }
        console.error('Failed to fetch devices:', error.message);
        return { statusCode: 500, body: `Failed to fetch devices: ${error.message}` };
    }
};
