import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    BellRing,
    CalendarClock,
    CheckCircle2,
    ExternalLink,
    Loader2,
    MessageCircle,
    Send,
    Eye,
} from 'lucide-react';
import { useState } from 'react';
import ConfirmDialog from '@/Components/ConfirmDialog';
import PageHeader from '@/Components/PageHeader';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import { Card } from '@/Components/ui/Card';
import EmptyState from '@/Components/ui/EmptyState';
import Modal from '@/Components/ui/Modal';
import StatCard from '@/Components/ui/StatCard';
import { daysLabel, formatDate, formatDateTime, cn } from '@/lib/utils';

const filters = [
    { key: 'all', label: 'الكل' },
    { key: 'due', label: 'مستحق قريباً' },
    { key: 'missed', label: 'متأخر' },
];

export default function NotificationsIndex({ reminders, stats, filter, reminderDays }) {
    const [sendingId, setSendingId] = useState(null);
    const [sendingAll, setSendingAll] = useState(false);
    const [showSendAll, setShowSendAll] = useState(false);
    const [preview, setPreview] = useState(null);

    const sendOne = (reminder) => {
        setSendingId(reminder.id);
        router.post(
            '/notifications/send',
            { vaccination_id: reminder.id, type: reminder.type },
            { preserveScroll: true, onFinish: () => setSendingId(null) },
        );
    };

    const sendAll = () => {
        setSendingAll(true);
        router.post('/notifications/send-all', {}, {
            preserveScroll: true,
            onFinish: () => {
                setSendingAll(false);
                setShowSendAll(false);
            },
        });
    };

    const changeFilter = (key) => {
        router.get('/notifications', { type: key }, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <AuthenticatedLayout title="الإشعارات">
            <Head title="الإشعارات" />

            <div className="space-y-6">
                <PageHeader
                    title="إشعارات واتساب"
                    subtitle={`الأطفال المستحقون للتطعيم خلال ${reminderDays} أيام أو المتأخرون.`}
                >
                    <Button
                        variant="primary"
                        onClick={() => setShowSendAll(true)}
                        disabled={sendingAll || reminders.length === 0}
                    >
                        {sendingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        إرسال الكل ({reminders.length})
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard icon={BellRing} tone="brand" label="إجمالي التنبيهات" value={stats.total} />
                    <StatCard icon={CalendarClock} tone="amber" label="مستحق قريباً" value={stats.due} />
                    <StatCard icon={AlertTriangle} tone="rose" label="متأخر" value={stats.missed} />
                    <StatCard
                        icon={CheckCircle2}
                        tone="emerald"
                        label="أُرسلت اليوم"
                        value={stats.sentToday}
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {filters.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => changeFilter(item.key)}
                            className={cn(
                                'rounded-xl px-4 py-2 text-sm font-semibold transition',
                                filter === item.key
                                    ? 'bg-brand-600 text-white shadow-sm'
                                    : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
                            )}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {reminders.length === 0 ? (
                    <Card>
                        <EmptyState
                            icon={CheckCircle2}
                            title="لا توجد تنبيهات"
                            description="لا يوجد أطفال مستحقون للتطعيم أو متأخرون في الوقت الحالي."
                        />
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {reminders.map((reminder) => (
                            <Card key={reminder.id} className="p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="truncate text-base font-bold text-slate-900">
                                                {reminder.child_name}
                                            </h3>
                                            <Badge tone={reminder.type === 'missed' ? 'rose' : 'amber'}>
                                                {reminder.type === 'missed' ? 'متأخر' : 'مستحق'}
                                            </Badge>
                                        </div>
                                        <p className="mt-1 text-sm text-slate-500">
                                            ولي الأمر: {reminder.parent_name} ·{' '}
                                            <span dir="ltr">{reminder.parent_phone}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-sm">
                                    <div>
                                        <p className="text-xs text-slate-500">التطعيم</p>
                                        <p className="font-semibold text-slate-700">
                                            {reminder.vaccine_name} — ج{reminder.dose_number}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">الموعد</p>
                                        <p className="font-semibold text-slate-700">
                                            {formatDate(reminder.due_date)} ({daysLabel(reminder.days_until_due)})
                                        </p>
                                    </div>
                                </div>

                                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500">
                                    {reminder.body}
                                </p>

                                {reminder.last_sent_at && (
                                    <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        آخر إرسال: {formatDateTime(reminder.last_sent_at)}
                                    </p>
                                )}

                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => sendOne(reminder)}
                                        disabled={sendingId === reminder.id}
                                    >
                                        {sendingId === reminder.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <MessageCircle className="h-4 w-4" />
                                        )}
                                        إرسال واتساب
                                    </Button>
                                    <Button
                                        as="a"
                                        href={reminder.wa_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        variant="secondary"
                                        size="sm"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        فتح في واتساب
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => setPreview(reminder)}>
                                        <Eye className="h-4 w-4" />
                                        معاينة
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Modal
                open={!!preview}
                onClose={() => setPreview(null)}
                title="معاينة الرسالة"
                description={preview ? `إلى: ${preview.parent_name} (${preview.parent_phone})` : ''}
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setPreview(null)}>
                            إغلاق
                        </Button>
                        <Button onClick={() => sendOne(preview)} disabled={sendingId === preview?.id}>
                            <Send className="h-4 w-4" />
                            إرسال الآن
                        </Button>
                    </>
                }
            >
                <div className="rounded-xl bg-[#e5f4e3] p-4">
                    <div className="rounded-lg bg-white p-4 shadow-sm">
                        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
                            {preview?.body}
                        </p>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog
                open={showSendAll}
                onClose={() => setShowSendAll(false)}
                onConfirm={sendAll}
                processing={sendingAll}
                tone="primary"
                title="إرسال جميع التنبيهات"
                message={`سيتم إرسال ${reminders.length} رسالة واتساب إلى أولياء الأمور. هل تريد المتابعة؟`}
                confirmLabel="إرسال الكل"
            />
        </AuthenticatedLayout>
    );
}
