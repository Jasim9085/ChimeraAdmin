const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
    try {
        const siteID = process.env.NETLIFY_SITE_ID;
        const token = process.env.NETLIFY_API_TOKEN;
        if (!siteID || !token) throw new Error("Netlify environment variables (NETLIFY_SITE_ID, NETLIFY_API_TOKEN) are not set.");
        
        const { deviceId, deviceName, stackTrace } = JSON.parse(event.body);
        const crashStore = getStore({ name: "chimera-crashes", siteID, token });
        const crashId = `${deviceId}-${new Date().toISOString()}`;
        
        await crashStore.setJSON(crashId, { deviceName, stackTrace });
        return { statusCode: 200, body: 'Crash log stored.' };
    } catch (error) {
        console.error('Failed to log crash:', error);
        return { statusCode: 500, body: 'Failed to log crash.' };
    }
};
