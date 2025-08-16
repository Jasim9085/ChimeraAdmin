const { getStore } = require("@netlify/blobs");

exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
    try {
        const data = JSON.parse(event.body);
        const { deviceId, deviceName, fcmToken } = data;
        const deviceStore = getStore("chimera-devices");
        await deviceStore.setJSON(deviceId, { deviceName, fcmToken });
        return { statusCode: 200, body: 'Device registered successfully.' };
    } catch (error) {
        return { statusCode: 500, body: 'Registration failed.' };
    }
};
