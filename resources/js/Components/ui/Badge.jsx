import { cn } from '@/lib/utils';

const tones = {
    slate: 'bg-slate-100 text-slate-700 ring-slate-500/20',
    brand: 'bg-brand-50 text-brand-700 ring-brand-600/20',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    rose: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    sky: 'bg-sky-50 text-sky-700 ring-sky-600/20',
    violet: 'bg-violet-50 text-violet-700 ring-violet-600/20',
};

export default function Badge({ tone = 'slate', className, children, dot, ...props }) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
                tones[tone],
                className,
            )}
            {...props}
        >
            {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />}
            {children}
        </span>
    );
}
