const { getStore } = require("@netlify/blobs");

const getStoreWithOptions = (storeName) => {
  return getStore({
    name: storeName,
    siteID: process.env.NETLIFY_SITE_ID,
    token: process.env.NETLIFY_API_TOKEN,
  });
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  try {
    const { deviceId, token } = JSON.parse(event.body);
    if (!deviceId || !token) {
      return { statusCode: 400, body: "Missing deviceId or token" };
    }
    const store = getStoreWithOptions("devices");
    await store.setJSON(deviceId, {
      token: token,
      lastSeen: new Date().toISOString(),
    });
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, deviceId }),
    };
  } catch (error) {
    console.error("Registration failed:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
