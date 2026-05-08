"use client";

import type { CloudSyncStatus } from "@/hooks/use-cloud-sync";

const SYNC_LABELS: Record<
    CloudSyncStatus,
    { label: string; icon: string; tone: string }
> = {
    disabled: {
        label: "Bulut kapalı",
        icon: "lucide--cloud-off",
        tone: "text-base-content/40",
    },
    idle: {
        label: "Senkron",
        icon: "lucide--cloud",
        tone: "text-base-content/60",
    },
    pulling: {
        label: "Senkronlanıyor…",
        icon: "lucide--cloud-download",
        tone: "text-info",
    },
    saving: {
        label: "Kaydediliyor…",
        icon: "lucide--loader",
        tone: "text-info",
    },
    saved: {
        label: "Kaydedildi",
        icon: "lucide--cloud-check",
        tone: "text-success",
    },
    conflict: {
        label: "Uzaktan güncellendi",
        icon: "lucide--cloud-alert",
        tone: "text-warning",
    },
    error: {
        label: "Kayıt başarısız",
        icon: "lucide--cloud-alert",
        tone: "text-error",
    },
};

export const SyncIndicator = ({ status }: { status: CloudSyncStatus }) => {
    const { label, icon, tone } = SYNC_LABELS[status];
    const isBusy = status === "saving" || status === "pulling";
    return (
        <div
            className={`inline-flex items-center gap-1.5 text-xs ${tone}`}
            role="status"
            aria-live="polite"
            title={label}>
            {isBusy ? (
                <span className="loading loading-spinner loading-xs" />
            ) : (
                <span className={`iconify ${icon} size-3.5`} />
            )}
            <span className="hidden sm:inline">{label}</span>
        </div>
    );
};
