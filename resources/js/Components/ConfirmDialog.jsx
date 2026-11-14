import { AlertTriangle } from 'lucide-react';
import Button from '@/Components/ui/Button';
import Modal from '@/Components/ui/Modal';

export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title = 'تأكيد العملية',
    message = 'هل أنت متأكد من تنفيذ هذه العملية؟',
    confirmLabel = 'تأكيد',
    cancelLabel = 'إلغاء',
    processing = false,
    tone = 'danger',
}) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            size="sm"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={processing}>
                        {cancelLabel}
                    </Button>
                    <Button variant={tone} onClick={onConfirm} disabled={processing}>
                        {processing ? 'جارٍ التنفيذ...' : confirmLabel}
                    </Button>
                </>
            }
        >
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                    <AlertTriangle className="h-5 w-5" />
                </div>
                <p className="text-sm leading-relaxed text-slate-600">{message}</p>
            </div>
        </Modal>
    );
}
