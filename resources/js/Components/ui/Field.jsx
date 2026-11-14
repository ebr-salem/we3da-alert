import { cn } from '@/lib/utils';

const base =
    'block w-full rounded-xl border-0 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 disabled:bg-slate-50 disabled:text-slate-400';

export function Input({ className, error, ...props }) {
    return (
        <input
            className={cn(base, error && 'ring-rose-400 focus:ring-rose-500', className)}
            {...props}
        />
    );
}

export function Textarea({ className, error, rows = 4, ...props }) {
    return (
        <textarea
            rows={rows}
            className={cn(base, error && 'ring-rose-400 focus:ring-rose-500', className)}
            {...props}
        />
    );
}

export function Select({ className, error, children, ...props }) {
    return (
        <select
            className={cn(base, 'pl-8 cursor-pointer', error && 'ring-rose-400 focus:ring-rose-500', className)}
            {...props}
        >
            {children}
        </select>
    );
}

export function Label({ className, required, children, ...props }) {
    return (
        <label className={cn('block text-sm font-semibold text-slate-700 mb-1.5', className)} {...props}>
            {children}
            {required && <span className="text-rose-500 mr-1">*</span>}
        </label>
    );
}

export function Field({ label, required, error, hint, children, className }) {
    return (
        <div className={cn('w-full', className)}>
            {label && <Label required={required}>{label}</Label>}
            {children}
            {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
            {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
        </div>
    );
}
