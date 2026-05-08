"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
    CloudSyncDisabledError,
    CloudSyncNotFoundError,
    isCloudSyncAvailable,
    pullMatchFromCloud,
    pushMatchToCloud,
} from "@/lib/cloud-sync";
import { matchToExport, parseImport } from "@/lib/match-format";
import type { Match } from "@/types/team";

export type CloudSyncStatus =
    | "disabled"
    | "idle"
    | "pulling"
    | "saving"
    | "saved"
    | "conflict"
    | "error";

type Options = {
    debounceMs?: number;
    pollMs?: number;
};

export const useCloudSync = (
    match: Match,
    setMatch: (next: Match) => void,
    ready: boolean,
    options: Options = {},
): CloudSyncStatus => {
    const { debounceMs = 1500, pollMs = 10_000 } = options;
    const [status, setStatus] = useState<CloudSyncStatus>(() =>
        isCloudSyncAvailable() ? "idle" : "disabled",
    );

    const etagRef = useRef<string | null>(null);
    // Serialized export shape of the last value we either pushed or pulled.
    // Used to distinguish real user edits from echoes of remote pulls.
    const baselineRef = useRef<string | null>(null);
    const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const conflictResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const initialPullDoneRef = useRef(false);

    // Apply a remote snapshot. Updates baseline FIRST so the resulting match
    // change isn't interpreted as a user edit and pushed straight back.
    const applyRemote = (data: unknown, etag: string | null): boolean => {
        const next = parseImport(data);
        if (!next) return false;
        baselineRef.current = JSON.stringify(matchToExport(next));
        etagRef.current = etag;
        setMatch(next);
        return true;
    };

    const pullOnce = async (): Promise<"applied" | "missing"> => {
        try {
            const { data, etag } = await pullMatchFromCloud();
            applyRemote(data, etag);
            return "applied";
        } catch (err) {
            if (err instanceof CloudSyncNotFoundError) return "missing";
            throw err;
        }
    };

    // Initial pull when the local snapshot has hydrated.
    useEffect(() => {
        if (!isCloudSyncAvailable()) {
            setStatus("disabled");
            return;
        }
        if (!ready) return;
        if (initialPullDoneRef.current) return;
        initialPullDoneRef.current = true;

        let cancelled = false;
        (async () => {
            setStatus("pulling");
            try {
                await pullOnce();
                if (!cancelled) setStatus("idle");
            } catch (err) {
                if (cancelled) return;
                if (err instanceof CloudSyncDisabledError) {
                    setStatus("disabled");
                } else {
                    setStatus("error");
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [ready]);

    // Debounced push on local edits.
    useEffect(() => {
        if (!isCloudSyncAvailable()) return;
        if (!ready) return;

        const serialized = JSON.stringify(matchToExport(match));
        if (baselineRef.current === null) {
            // First observation — establish baseline without pushing. Initial
            // pull (if it lands first) already set this; otherwise the local
            // value becomes the baseline.
            baselineRef.current = serialized;
            return;
        }
        if (serialized === baselineRef.current) return;
        baselineRef.current = serialized;

        if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
        setStatus("saving");
        pushTimerRef.current = setTimeout(async () => {
            try {
                // GET-before-PUT conflict check. S3 anonymous PUTs can't use
                // If-Match (requires SigV4), so we do the comparison client-
                // side. Race window between this GET and the PUT is small but
                // non-zero — acceptable for low-concurrency office use.
                if (etagRef.current !== null) {
                    try {
                        const remote = await pullMatchFromCloud();
                        if (remote.etag !== etagRef.current) {
                            applyRemote(remote.data, remote.etag);
                            toast.warning(
                                "Başka biri maçı düzenledi. En güncel hali yüklendi.",
                            );
                            setStatus("conflict");
                            if (conflictResetRef.current)
                                clearTimeout(conflictResetRef.current);
                            conflictResetRef.current = setTimeout(() => {
                                setStatus("idle");
                            }, 3000);
                            return;
                        }
                    } catch (err) {
                        if (err instanceof CloudSyncNotFoundError) {
                            // Remote was deleted; fall through and recreate.
                            etagRef.current = null;
                        } else {
                            throw err;
                        }
                    }
                }
                const newEtag = await pushMatchToCloud(matchToExport(match));
                etagRef.current = newEtag;
                setStatus("saved");
            } catch (err) {
                if (err instanceof CloudSyncDisabledError) {
                    setStatus("disabled");
                } else {
                    setStatus("error");
                }
            }
        }, debounceMs);
    }, [match, ready, debounceMs]);

    // Periodic poll: pick up other users' changes.
    useEffect(() => {
        if (!isCloudSyncAvailable()) return;
        if (!ready) return;

        const tick = async () => {
            if (typeof document !== "undefined" && document.hidden) return;
            try {
                const { data, etag } = await pullMatchFromCloud();
                if (etag && etag !== etagRef.current) {
                    applyRemote(data, etag);
                }
            } catch {
                // transient errors during poll don't change status
            }
        };

        pollTimerRef.current = setInterval(tick, pollMs);

        const onVisible = () => {
            if (!document.hidden) tick();
        };
        document.addEventListener("visibilitychange", onVisible);

        return () => {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [ready, pollMs]);

    useEffect(() => {
        return () => {
            if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
            if (conflictResetRef.current) clearTimeout(conflictResetRef.current);
        };
    }, []);

    return status;
};
