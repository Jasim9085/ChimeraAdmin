const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
    try {
        const { deviceId, deviceName, stackTrace } = JSON.parse(event.body);
        const crashStore = getStore("chimera-crashes");
        const crashId = `${deviceId}-${new Date().toISOString()}`;
        
        await crashStore.setJSON(crashId, { deviceName, stackTrace, receivedAt: new Date().toISOString() });
        return { statusCode: 200, body: 'Crash log stored.' };
    } catch (error) {
        console.error('Failed to log crash:', error);
        return { statusCode: 500, body: 'Failed to log crash.' };
    }
};
