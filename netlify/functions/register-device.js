const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { deviceId, token } = JSON.parse(event.body);
    if (!deviceId || !token) {
      return { statusCode: 400, body: "Missing deviceId or token" };
    }

    const store = getStore("devices");
    const deviceData = {
      token: token,
      lastSeen: new Date().toISOString(),
    };
    
    await store.setJSON(deviceId, deviceData);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, deviceId }),
    };
  } catch (error) {
    console.error("Registration failed:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
