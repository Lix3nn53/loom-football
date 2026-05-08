type ILogo = {
    className?: string;
};

export const Logo = ({ className }: ILogo) => {
    return (
        <img
            src="/favicon.png"
            alt="Loom Football logosu"
            width={32}
            height={32}
            className={`size-8 rounded-full object-contain ${className ?? ""}`}
        />
    );
};
