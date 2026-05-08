import { type Metadata } from "next";
import { type ReactNode } from "react";

import { ConfigProvider } from "@/contexts/config";
import { Toaster } from "@/components/Toaster";
import "@/styles/app.css";

export const metadata: Metadata = {
    title: {
        template: "%s - Loom Football",
        default: "Loom Football - Team Management",
    },
    description:
        "Pick a formation, drop your players on the pitch, and manage the office football lineup.",
    icons: {
        icon: "/favicon.ico",
    },
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning className="group/html">
            <head>
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
