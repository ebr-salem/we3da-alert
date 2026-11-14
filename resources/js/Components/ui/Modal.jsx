import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { X } from 'lucide-react';
import { Fragment } from 'react';
import { cn } from '@/lib/utils';

export default function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <Transition show={open} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-50">
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 flex items-center justify-center overflow-y-auto p-4">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel
                            className={cn(
                                'w-full rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5',
                                sizes[size],
                            )}
                        >
                            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
                                <div>
                                    <DialogTitle className="text-base font-bold text-slate-900">
                                        {title}
                                    </DialogTitle>
                                    {description && (
                                        <p className="mt-1 text-sm text-slate-500">{description}</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="px-5 py-5">{children}</div>

                            {footer && (
                                <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-4">
                                    {footer}
                                </div>
                            )}
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    );
}
