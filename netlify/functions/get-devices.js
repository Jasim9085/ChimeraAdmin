const { getStore } = require("@netlify/blobs");

const getStoreWithOptions = (storeName) => {
  return getStore({
    name: storeName,
    siteID: process.env.NETLIFY_SITE_ID,
    token: process.env.NETLIFY_API_TOKEN,
  });
};

exports.handler = async () => {
  try {
    const store = getStoreWithOptions("devices");
    const { blobs } = await store.list();
    const detailedDevices = await Promise.all(
      blobs.map(async (blob) => {
        const data = await store.get(blob.key, { type: 'json' });
        return { deviceId: blob.key, token: data.token };
      })
    );
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(detailedDevices),
    };
  } catch (error) {
    console.error("Failed to get devices:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
