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
    const { deviceId, alias } = JSON.parse(event.body);
    if (!deviceId) {
      return { statusCode: 400, body: "Missing deviceId" };
    }
    const store = getStoreWithOptions("devices");
    const deviceData = await store.get(deviceId, { type: 'json' });
    if (!deviceData) {
        return { statusCode: 404, body: "Device not found" };
    }
    deviceData.alias = alias;
    await store.setJSON(deviceId, deviceData);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, deviceId, alias }),
    };
  } catch (error) {
    console.error("Set alias failed:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
