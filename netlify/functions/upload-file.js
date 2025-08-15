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
    const { deviceId, dataType, fileData } = JSON.parse(event.body);
    if (!deviceId || !dataType || !fileData) {
      return { statusCode: 400, body: "Missing required fields" };
    }
    const store = getStoreWithOptions(deviceId);
    const entryId = `${dataType}-${Date.now()}`;
    const dataToStore = {
      id: entryId,
      dataType: dataType,
      payload: fileData, 
      timestamp: new Date().toISOString()
    };
    await store.setJSON(entryId, dataToStore);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, id: entryId }),
    };
  } catch (error) {
    console.error("File upload failed:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
