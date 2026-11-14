import { cn } from '@/lib/utils';

const variants = {
    primary:
        'bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600 shadow-sm',
    secondary:
        'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus-visible:outline-slate-400',
    danger:
        'bg-rose-600 text-white hover:bg-rose-700 focus-visible:outline-rose-600 shadow-sm',
    success:
        'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:outline-emerald-600 shadow-sm',
    ghost:
        'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-slate-400',
};

const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-5 py-3 text-base gap-2',
    icon: 'p-2',
};

export default function Button({
    variant = 'primary',
    size = 'md',
    className,
    as: Tag = 'button',
    type = 'button',
    ...props
}) {
    return (
        <Tag
            type={Tag === 'button' ? type : undefined}
            className={cn(
                'inline-flex items-center justify-center rounded-xl font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                variants[variant],
                sizes[size],
                className,
            )}
            {...props}
        />
    );
}
