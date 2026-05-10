"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useEscapeToClose } from "@/hooks/use-escape-to-close";
import { CloudSyncDisabledError, pushMatchToCloud } from "@/lib/cloud-sync";
import { matchToExport } from "@/lib/match-format";
import type { Match } from "@/types/team";

type ExportModalProps = {
    open: boolean;
    onClose: () => void;
    match: Match;
};

export const ExportModal = ({ open, onClose, match }: ExportModalProps) => {
    useEscapeToClose(open, onClose);
    const [pushing, setPushing] = useState(false);
    const json = JSON.stringify(matchToExport(match), null, 2);
    const benchSummary = `Reds bench: ${match.red.roster.length - Object.values(match.red.assignments).filter(Boolean).length} · Blues bench: ${match.blue.roster.length - Object.values(match.blue.assignments).filter(Boolean).length}`;

    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(json);
            toast.success("Copied to clipboard");
        } catch {
            toast.error("Could not copy");
        }
    };

    const onDownload = () => {
        try {
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            const ts = new Date().toISOString().slice(0, 10);
            a.href = url;
            a.download = `loom-football-${ts}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            toast.success("File downloaded");
        } catch {
            toast.error("Could not download");
        }
    };

    const onPushCloud = async () => {
        setPushing(true);
        try {
            await pushMatchToCloud(matchToExport(match));
            toast.success("Pushed to cloud");
        } catch (err) {
            if (err instanceof CloudSyncDisabledError) {
                toast.error("Cloud sync not configured", {
                    description: "Deploy the Amplify backend first.",
                });
            } else {
                toast.error("Could not push to cloud");
            }
        } finally {
            setPushing(false);
        }
    };

    return (
        <dialog className={`modal ${open ? "modal-open" : ""}`}>
            <div className="modal-box max-w-2xl">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold inline-flex items-center gap-2">
                        <span className="iconify lucide--download size-5" />
                        Export match
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-ghost btn-sm btn-square"
                        aria-label="Close">
                        <span className="iconify lucide--x size-4" />
                    </button>
                </div>

                <p className="text-sm text-base-content/70 mb-1">
                    Includes both teams&apos; lineups and benches.
                </p>
                <p className="text-xs text-base-content/50 mb-2">{benchSummary}</p>
                <textarea
                    readOnly
                    value={json}
                    className="textarea textarea-sm font-mono w-full h-64"
                    aria-label="Match JSON"
                />

                <div className="modal-action mt-3 flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={onCopy}
                        className="btn btn-sm btn-primary">
                        <span className="iconify lucide--clipboard-copy size-4" />
                        Copy to clipboard
                    </button>
                    <button type="button" onClick={onDownload} className="btn btn-sm">
                        <span className="iconify lucide--file-down size-4" />
                        Download .json
                    </button>
                    <button
                        type="button"
                        onClick={onPushCloud}
                        disabled={pushing}
                        className="btn btn-sm">
                        {pushing ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <span className="iconify lucide--cloud-upload size-4" />
                        )}
                        Push to cloud
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-sm btn-ghost ml-auto">
                        Close
                    </button>
                </div>
            </div>
            <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="modal-backdrop"
            />
        </dialog>
    );
};
