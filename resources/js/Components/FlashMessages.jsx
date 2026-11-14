import { usePage } from '@inertiajs/react';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function FlashMessages() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setVisible({ type: 'success', message: flash.success });
        } else if (flash?.error) {
            setVisible({ type: 'error', message: flash.error });
        } else {
            return;
        }

        const timer = setTimeout(() => setVisible(null), 5000);
        return () => clearTimeout(timer);
    }, [flash?.success, flash?.error]);

    if (!visible) return null;

    const isSuccess = visible.type === 'success';

    return (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
            <div
                className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border p-4 shadow-lg animate-fade-in-up ${
                    isSuccess
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-rose-200 bg-rose-50 text-rose-800'
                }`}
            >
                {isSuccess ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                ) : (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                )}
                <p className="flex-1 text-sm font-semibold leading-relaxed">{visible.message}</p>
                <button
                    type="button"
                    onClick={() => setVisible(null)}
                    className="rounded-lg p-1 text-current/60 transition hover:bg-black/5"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
