type ILogo = {
    className?: string;
};

export const Logo = ({ className }: ILogo) => {
    return (
        <span
            className={`flex size-8 items-center justify-center rounded-full bg-base-content text-base-100 ${className ?? ""}`}
            aria-label="Loom Football logo">
            <svg
                viewBox="0 0 32 32"
                className="size-5"
                fill="currentColor"
                aria-hidden="true">
                <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
                <path
                    d="M16 6 L20 9 L18 14 L14 14 L12 9 Z M6 14 L10 12 L14 14 L13 18 L8 19 Z M22 12 L26 14 L24 19 L19 18 L18 14 Z M11 21 L15 19 L17 19 L21 21 L18 25 L14 25 Z"
                    fill="currentColor"
                />
            </svg>
        </span>
    );
};
