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
    const { deviceId } = JSON.parse(event.body);
    if (!deviceId) {
      return { statusCode: 400, body: "Missing deviceId" };
    }
    
    const devicesStore = getStoreWithOptions("devices");
    await devicesStore.delete(deviceId);

    const deviceLogsStore = getStoreWithOptions(deviceId);
    await deviceLogsStore.deleteStore();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, message: `Device ${deviceId} and all its logs have been deleted.` }),
    };
  } catch (error) {
    console.error("Delete device failed:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
