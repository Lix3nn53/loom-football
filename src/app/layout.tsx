import { type Metadata } from "next";
import { type ReactNode } from "react";

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
        <html
            lang="tr"
            data-theme="dark"
            suppressHydrationWarning
            className="group/html">
            <head>
                <meta name="darkreader-lock" />
                <link rel="preconnect" href="https://fonts.gstatic.com" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
            </head>
            <body>
                <Toaster />
                {children}
            </body>
        </html>
    );
}
