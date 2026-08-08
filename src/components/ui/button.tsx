interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'outline';
}

export function Button({ children , className = '', variant = 'default', ...props }: ButtonProps) {

    const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium px-4 py-2 transition-colors";

    const variantStyle = variant === 'outline'
        ? "border border-slate-300 bg-transparent hover:bg-slate-100"
        : "bg-slate-900 text-white hover:bg-slate-800";

    return (
        <button className={`${baseStyle} ${variantStyle} ${className}`} {...props}>
            {children}
        </button>
    );
}