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

export const pullMatchFromCloud = async (): Promise<unknown> => {
    if (!SYNC_URL) throw new CloudSyncDisabledError();
    const res = await fetch(SYNC_URL, { cache: "no-store" });
    if (res.status === 404) throw new CloudSyncNotFoundError();
    if (!res.ok) throw new Error(`Cloud pull failed: HTTP ${res.status}`);
    return res.json();
};

export const pushMatchToCloud = async (data: unknown): Promise<void> => {
    if (!SYNC_URL) throw new CloudSyncDisabledError();
    const res = await fetch(SYNC_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data, null, 2),
    });
    if (!res.ok) throw new Error(`Cloud push failed: HTTP ${res.status}`);
};
