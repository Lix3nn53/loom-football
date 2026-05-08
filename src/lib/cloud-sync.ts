"use client";

import { downloadData, uploadData } from "aws-amplify/storage";

import { ensureAmplify } from "./amplify-config";

export class CloudSyncDisabledError extends Error {
    constructor() {
        super(
            "Cloud sync is not configured. Deploy the Amplify backend to enable it.",
        );
        this.name = "CloudSyncDisabledError";
    }
}

export class CloudSyncNotFoundError extends Error {
    constructor() {
        super("No match found in cloud yet.");
        this.name = "CloudSyncNotFoundError";
    }
}

const MATCH_PATH = "shared/match.json";

const isNotFound = (err: unknown): boolean => {
    if (!err || typeof err !== "object") return false;
    const e = err as { name?: string; message?: string };
    const name = e.name ?? "";
    const msg = e.message ?? "";
    return (
        name === "NoSuchKey" ||
        name === "NotFound" ||
        msg.includes("not found") ||
        msg.includes("does not exist")
    );
};

export const isCloudSyncAvailable = async (): Promise<boolean> => {
    return await ensureAmplify();
};

export const pullMatchFromCloud = async (): Promise<unknown> => {
    if (!(await ensureAmplify())) throw new CloudSyncDisabledError();
    try {
        const result = await downloadData({ path: MATCH_PATH }).result;
        const text = await result.body.text();
        return JSON.parse(text);
    } catch (err) {
        if (isNotFound(err)) throw new CloudSyncNotFoundError();
        throw err;
    }
};

export const pushMatchToCloud = async (data: unknown): Promise<void> => {
    if (!(await ensureAmplify())) throw new CloudSyncDisabledError();
    const body = JSON.stringify(data, null, 2);
    await uploadData({
        path: MATCH_PATH,
        data: body,
        options: { contentType: "application/json" },
    }).result;
};

