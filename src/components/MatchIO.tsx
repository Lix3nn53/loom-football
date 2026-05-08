"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
    CloudSyncDisabledError,
    CloudSyncNotFoundError,
    pullMatchFromCloud,
    pushMatchToCloud,
} from "@/lib/cloud-sync";
import { matchToExport, parseImport, type ImportedTeams } from "@/lib/match-format";
import type { Match } from "@/types/team";

// ----- modal helpers -----

const useEscapeToClose = (open: boolean, onClose: () => void) => {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);
};

// ============================================================================

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

type ImportModalProps = {
    open: boolean;
    onClose: () => void;
    onImport: (teams: ImportedTeams) => void;
};

export const ImportModal = ({ open, onClose, onImport }: ImportModalProps) => {
    useEscapeToClose(open, onClose);
    const [text, setText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [pulling, setPulling] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setText("");
            setError(null);
            setDragActive(false);
            setPulling(false);
        }
    }, [open]);

    const tryImport = (raw: string) => {
        let parsed: unknown;
        try {
            parsed = JSON.parse(raw);
        } catch {
            setError("Could not parse JSON.");
            return;
        }
        const teams = parseImport(parsed);
        if (!teams) {
            setError(
                "Invalid match file. Expected red and blue teams with lineup and bench.",
            );
            return;
        }
        onImport(teams);
        onClose();
        toast.success("Match imported");
    };

    const onPasteClipboard = async () => {
        try {
            const t = await navigator.clipboard.readText();
            setText(t);
            setError(null);
        } catch {
            toast.error("Clipboard access denied");
        }
    };

    const onPullCloud = async () => {
        setPulling(true);
        setError(null);
        try {
            const remote = await pullMatchFromCloud();
            const teams = parseImport(remote.data);
            if (!teams) {
                setError("Cloud match is in an unrecognised shape.");
                return;
            }
            onImport(teams);
            onClose();
            toast.success("Pulled match from cloud");
        } catch (err) {
            if (err instanceof CloudSyncDisabledError) {
                setError("Cloud sync not configured. Deploy the Amplify backend first.");
            } else if (err instanceof CloudSyncNotFoundError) {
                setError("No match has been pushed to the cloud yet.");
            } else {
                setError("Could not pull from cloud.");
            }
        } finally {
            setPulling(false);
        }
    };

    const loadFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            const t = String(reader.result ?? "");
            setText(t);
            setError(null);
        };
        reader.onerror = () => setError("Could not read file.");
        reader.readAsText(file);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) loadFile(file);
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (file) loadFile(file);
    };

    return (
        <dialog className={`modal ${open ? "modal-open" : ""}`}>
            <div className="modal-box max-w-2xl">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold inline-flex items-center gap-2">
                        <span className="iconify lucide--upload size-5" />
                        Import match
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-ghost btn-sm btn-square"
                        aria-label="Close">
                        <span className="iconify lucide--x size-4" />
                    </button>
                </div>

                <div className="flex justify-end mb-2">
                    <button
                        type="button"
                        onClick={onPullCloud}
                        disabled={pulling}
                        className="btn btn-sm btn-outline">
                        {pulling ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <span className="iconify lucide--cloud-download size-4" />
                        )}
                        Pull from cloud
                    </button>
                </div>

                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        if (!dragActive) setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={onDrop}
                    onClick={() => fileRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            fileRef.current?.click();
                        }
                    }}
                    className={`flex flex-col items-center justify-center gap-1 rounded-box border-2 border-dashed p-6 cursor-pointer transition-colors ${
                        dragActive
                            ? "border-primary bg-primary/10"
                            : "border-base-300 hover:bg-base-200"
                    }`}>
                    <span className="iconify lucide--file-up size-8 text-base-content/60" />
                    <div className="text-sm font-medium">Drop a JSON file here</div>
                    <div className="text-xs text-base-content/60">or click to browse</div>
                </div>
                <input
                    ref={fileRef}
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={onFileChange}
                />

                <div className="divider text-xs text-base-content/50 my-2">
                    or paste JSON
                </div>

                <textarea
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        setError(null);
                    }}
                    placeholder='{"activeSide":"red","red":{...},"blue":{...}}'
                    className="textarea textarea-sm font-mono w-full h-40"
                    aria-label="Paste match JSON"
                />
                <div className="mt-2">
                    <button
                        type="button"
                        onClick={onPasteClipboard}
                        className="btn btn-xs btn-ghost">
                        <span className="iconify lucide--clipboard-paste size-3.5" />
                        Paste from clipboard
                    </button>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="alert alert-error alert-soft mt-3 py-2 text-sm">
                        <span className="iconify lucide--alert-circle size-4" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="modal-action mt-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-sm btn-ghost">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => tryImport(text)}
                        disabled={!text.trim()}
                        className="btn btn-sm btn-primary">
                        <span className="iconify lucide--check size-4" />
                        Import match
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
