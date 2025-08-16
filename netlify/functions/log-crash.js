const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
    try {
        const { siteID, token } = { siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_API_TOKEN };
        if (!siteID || !token) throw new Error("Missing Netlify environment variables.");
        
        const { deviceId, deviceName, stackTrace } = JSON.parse(event.body);
        const crashStore = getStore("chimera-crashes", { siteID, token });
        const crashId = `${deviceId}-${new Date().toISOString()}`;
        
        await crashStore.setJSON(crashId, { deviceName, stackTrace });
        return { statusCode: 200, body: 'Crash log stored.' };
    } catch (error) {
        console.error('Failed to log crash:', error);
        return { statusCode: 500, body: 'Failed to log crash.' };
    }
};
