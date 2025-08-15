import { getStore } from "@netlify/blobs";

export default async (req) => {
    const url = new URL(req.url);
    const deviceId = url.searchParams.get("deviceId");

    if (!deviceId) {
        return new Response("Missing deviceId parameter", { status: 400 });
    }
    
    try {
        const store = getStore(deviceId);
        const { blobs } = await store.list();

        const dataEntries = await Promise.all(
            blobs.map(async (blob) => {
                const data = await store.get(blob.key, { type: 'json' });
                return data;
            })
        );
        
        dataEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return new Response(JSON.stringify(dataEntries), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Failed to get device data:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
