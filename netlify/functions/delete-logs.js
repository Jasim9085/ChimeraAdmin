
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
    
    const store = getStoreWithOptions(deviceId);
    const { blobs } = await store.list();

    const keysToDelete = blobs.map(blob => blob.key);
    if (keysToDelete.length > 0) {
        await store.delete(keysToDelete);
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, message: `Deleted ${keysToDelete.length} logs for device ${deviceId}.` }),
    };
  } catch (error) {
    console.error("Delete logs failed:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
