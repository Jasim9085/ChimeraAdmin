import { getStore } from "@netlify/blobs";

export default async () => {
  try {
    const store = getStore("devices");
    const { blobs } = await store.list();

    const devices = blobs.map(blob => ({
      deviceId: blob.key,
      // We don't need to return the full token data here for security
    }));

    // To get the token, we need to fetch each one.
    // This is less efficient but necessary for the admin panel's send function.
    const detailedDevices = await Promise.all(
        blobs.map(async (blob) => {
            const data = await store.get(blob.key, { type: 'json' });
            return { deviceId: blob.key, token: data.token };
        })
    );


    return new Response(JSON.stringify(detailedDevices), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to get devices:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
