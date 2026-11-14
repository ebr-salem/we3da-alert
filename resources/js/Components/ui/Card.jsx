import { cn } from '@/lib/utils';

export function Card({ className, children, ...props }) {
    return (
        <div
            className={cn('rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5', className)}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className, title, subtitle, action, children }) {
    return (
        <div className={cn('flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4', className)}>
            <div className="min-w-0">
                {title && <h3 className="text-base font-bold text-slate-900 truncate">{title}</h3>}
                {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
                {children}
            </div>
            {action}
        </div>
    );
}

export function CardBody({ className, children }) {
    return <div className={cn('p-5', className)}>{children}</div>;
}
