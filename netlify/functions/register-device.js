const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    try {
        const siteID = process.env.NETLIFY_SITE_ID;
        const token = process.env.NETLIFY_API_TOKEN;
        if (!siteID || !token) throw new Error("Netlify environment variables (NETLIFY_SITE_ID, NETLIFY_API_TOKEN) are not set.");

        const data = JSON.parse(event.body);
        const { deviceId, deviceName, fcmToken } = data;
        if (!deviceId || !deviceName || !fcmToken) return { statusCode: 400, body: 'Missing required fields.' };

        const deviceStore = getStore({ name: "chimera-devices", siteID, token });
        await deviceStore.setJSON(deviceId, { deviceName, fcmToken, registeredAt: new Date().toISOString() });
        return { statusCode: 200, body: 'Device registered successfully.' };
    } catch (error) {
        console.error('Registration failed:', error.message);
        return { statusCode: 500, body: `Registration failed: ${error.message}` };
    }
};
