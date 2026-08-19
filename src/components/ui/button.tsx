interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'icon';
}

export function Button({
    children,
    className = "",
    variant = "default",
    size = "md",
    ...props
}: ButtonProps) {

    const baseStyle =
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

    const sizeStyle = {
        sm: "h-9 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-5 text-sm",
        icon: "h-10 w-10 p-0",
    }[size];

    const variantStyle = {
        default:
            "bg-slate-900 text-white hover:bg-slate-800",

        outline:
            "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",

        ghost:
            "bg-transparent text-slate-600 hover:bg-slate-100",

        danger:
            "bg-red-500 text-white hover:bg-red-600",
    }[variant];

    return (
        <button
            className={`${baseStyle} ${sizeStyle} ${variantStyle} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}