"use client";

const SYNC_URL = process.env.NEXT_PUBLIC_CLOUD_SYNC_URL;

export class CloudSyncDisabledError extends Error {
    constructor() {
        super(
            "Cloud sync is not configured. Set NEXT_PUBLIC_CLOUD_SYNC_URL to enable it.",
        );
        this.name = "CloudSyncDisabledError";
    }
}

export class CloudSyncNotFoundError extends Error {
    constructor() {
        super("No match has been pushed to the cloud yet.");
        this.name = "CloudSyncNotFoundError";
    }
}

export const isCloudSyncAvailable = () => Boolean(SYNC_URL);

export type CloudSnapshot = {
    data: unknown;
    etag: string | null;
};

export const pullMatchFromCloud = async (): Promise<CloudSnapshot> => {
    if (!SYNC_URL) throw new CloudSyncDisabledError();
    const res = await fetch(SYNC_URL, { cache: "no-store" });
    if (res.status === 404) throw new CloudSyncNotFoundError();
    if (!res.ok) throw new Error(`Cloud pull failed: HTTP ${res.status}`);
    const data = await res.json();
    return { data, etag: res.headers.get("etag") };
};

// Anonymous public-bucket PUTs cannot use If-Match / If-None-Match — S3
// requires SigV4 signing for conditional writes. Conflict detection is
// done client-side by the caller (GET-before-PUT).
export const pushMatchToCloud = async (
    data: unknown,
): Promise<string | null> => {
    if (!SYNC_URL) throw new CloudSyncDisabledError();
    const res = await fetch(SYNC_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data, null, 2),
    });
    if (!res.ok) throw new Error(`Cloud push failed: HTTP ${res.status}`);
    return res.headers.get("etag");
};
