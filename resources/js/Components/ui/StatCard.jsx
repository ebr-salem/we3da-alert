import { cn } from '@/lib/utils';

const tones = {
    brand: 'bg-brand-50 text-brand-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    sky: 'bg-sky-50 text-sky-600',
    violet: 'bg-violet-50 text-violet-600',
};

export default function StatCard({ icon: Icon, label, value, hint, tone = 'brand', className }) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5',
                className,
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
                    {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
                </div>
                {Icon && (
                    <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', tones[tone])}>
                        <Icon className="h-5.5 w-5.5" />
                    </div>
                )}
            </div>
        </div>
    );
}
