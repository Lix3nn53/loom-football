import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Not Found",
};

const NotFoundPage = () => {
    return (
        <div className="flex h-screen w-screen flex-col items-center justify-center gap-4">
            <span className="iconify lucide--ghost size-20 opacity-60" />
            <h1 className="text-3xl font-semibold">Page not found</h1>
            <p className="text-base-content/70">This page does not exist.</p>
            <Link href="/" className="btn btn-primary mt-2">
                Back to lineup
            </Link>
        </div>
    );
};

export default NotFoundPage;
