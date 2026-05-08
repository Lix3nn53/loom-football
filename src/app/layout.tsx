import { type Metadata } from "next";
import { type ReactNode } from "react";

import { ConfigProvider } from "@/contexts/config";
import { Toaster } from "@/components/Toaster";
import "@/styles/app.css";

export const metadata: Metadata = {
    title: {
        template: "%s - Loom Football",
        default: "Loom Football - Takım Yönetimi",
    },
    description:
        "Bir diziliş seç, oyuncularını sahaya yerleştir ve ofis futbol takımını yönet.",
    icons: {
        icon: [{ url: "/favicon.png", type: "image/png" }],
    },
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="tr" suppressHydrationWarning className="group/html">
            <head>
                <meta name="darkreader-lock" />
                <link rel="preconnect" href="https://fonts.gstatic.com" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                {/* eslint-disable-next-line @next/next/no-sync-scripts */}
                <script type="text/javascript" src="/js/prefetch-config.js"></script>
            </head>
            <body>
                <ConfigProvider>
                    <Toaster />
                    {children}
                </ConfigProvider>
            </body>
        </html>
    );
}
