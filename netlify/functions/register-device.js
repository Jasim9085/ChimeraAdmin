import { getStore } from "@netlify/blobs";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { deviceId, token } = await req.json();
    if (!deviceId || !token) {
      return new Response("Missing deviceId or token", { status: 400 });
    }

    const store = getStore("devices");
    const deviceData = {
      token: token,
      lastSeen: new Date().toISOString(),
    };
    
    await store.setJSON(deviceId, deviceData);

    return new Response(JSON.stringify({ success: true, deviceId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Registration failed:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};```

**File:** `chimeradmin/netlify/functions/get-devices.js`
```javascript
import { getStore } from "@netlify/blobs";

export default async () => {
  try {
    const store = getStore("devices");
    const { blobs } = await store.list();

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
