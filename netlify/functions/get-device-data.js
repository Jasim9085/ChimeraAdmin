const { getStore } = require("@netlify/blobs");

const getStoreWithOptions = (storeName) => {
  return getStore({
    name: storeName,
    siteID: process.env.NETLIFY_SITE_ID,
    token: process.env.NETLIFY_API_TOKEN,
  });
};

exports.handler = async (event) => {
  const deviceId = event.queryStringParameters.deviceId;
  if (!deviceId) {
    return { statusCode: 400, body: "Missing deviceId parameter" };
  }
  try {
    const store = getStoreWithOptions(deviceId);
    const { blobs } = await store.list();
    const dataEntries = await Promise.all(
      blobs.map(async (blob) => {
        return await store.get(blob.key, { type: 'json' });
      })
    );
    dataEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataEntries),
    };
  } catch (error) {
    console.error("Failed to get device data:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
