const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
    try {
        const data = JSON.parse(event.body);
        const { deviceId, deviceName, fcmToken } = data;

        if (!deviceId || !deviceName || !fcmToken) {
            return { statusCode: 400, body: 'Missing required fields.' };
        }

        const deviceStore = getStore("chimera-devices");
        await deviceStore.setJSON(deviceId, { deviceName, fcmToken, registeredAt: new Date().toISOString() });
        return { statusCode: 200, body: 'Device registered successfully.' };
    } catch (error) {
        console.error('Registration failed:', error);
        return { statusCode: 500, body: 'Registration failed.' };
    }
};
