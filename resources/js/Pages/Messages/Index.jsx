import { Head, router } from '@inertiajs/react';
import { Eye, MessageSquareText, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ConfirmDialog from '@/Components/ConfirmDialog';
import PageHeader from '@/Components/PageHeader';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import { Card } from '@/Components/ui/Card';
import EmptyState from '@/Components/ui/EmptyState';
import { Field, Input, Select } from '@/Components/ui/Field';
import Modal from '@/Components/ui/Modal';
import Pagination from '@/Components/ui/Pagination';
import { formatDateTime } from '@/lib/utils';

const statusTone = { sent: 'emerald', failed: 'rose', pending: 'amber' };

export default function MessagesIndex({ messages, filters }) {
    const [search, setSearch] = useState(filters.q ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [type, setType] = useState(filters.type ?? '');
    const [preview, setPreview] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [processing, setProcessing] = useState(false);

    const applyFilters = (overrides = {}) => {
        router.get(
            '/messages',
            { q: search, status, type, ...overrides },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const submit = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const confirmDelete = () => {
        setProcessing(true);
        router.delete(`/messages/${deleting.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setDeleting(null);
            },
        });
    };

    return (
        <AuthenticatedLayout title="سجل الرسائل">
            <Head title="سجل الرسائل" />

            <div className="space-y-6">
                <PageHeader title="سجل الرسائل" subtitle="جميع رسائل واتساب المرسلة لأولياء الأمور." />

                <Card>
                    <form
                        onSubmit={submit}
                        className="grid grid-cols-1 gap-4 border-b border-slate-100 p-5 md:grid-cols-4"
                    >
                        <Field className="md:col-span-2">
                            <div className="relative">
                                <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="ابحث بالاسم أو الرقم أو نص الرسالة..."
                                    className="pr-11"
                                />
                            </div>
                        </Field>
                        <Field>
                            <Select
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value);
                                    applyFilters({ status: e.target.value });
                                }}
                            >
                                <option value="">كل الحالات</option>
                                <option value="sent">تم الإرسال</option>
                                <option value="failed">فشل</option>
                                <option value="pending">في الانتظار</option>
                            </Select>
                        </Field>
                        <Field>
                            <Select
                                value={type}
                                onChange={(e) => {
                                    setType(e.target.value);
                                    applyFilters({ type: e.target.value });
                                }}
                            >
                                <option value="">كل الأنواع</option>
                                <option value="reminder">تذكير بموعد</option>
                                <option value="missed">تنبيه تأخر</option>
                                <option value="custom">مخصصة</option>
                            </Select>
                        </Field>
                    </form>

                    {messages.data.length === 0 ? (
                        <EmptyState
                            icon={MessageSquareText}
                            title="لا توجد رسائل"
                            description="لم يتم إرسال أي رسائل بعد."
                        />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-right">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-xs font-semibold uppercase text-slate-500">
                                            <th className="px-5 py-3">المستلم</th>
                                            <th className="px-5 py-3">النوع</th>
                                            <th className="px-5 py-3">الحالة</th>
                                            <th className="px-5 py-3">التاريخ</th>
                                            <th className="px-5 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {messages.data.map((message) => (
                                            <tr key={message.id} className="transition hover:bg-slate-50/60">
                                                <td className="px-5 py-3.5">
                                                    <p className="text-sm font-bold text-slate-800">
                                                        {message.parent_name ?? '—'}
                                                    </p>
                                                    <p className="text-xs text-slate-500" dir="ltr">
                                                        {message.parent_phone}
                                                    </p>
                                                    {message.child_name && (
                                                        <p className="text-xs text-slate-400">
                                                            الطفل: {message.child_name}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <Badge tone="brand">{message.type_label}</Badge>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <Badge tone={statusTone[message.status]}>
                                                        {message.status_label}
                                                    </Badge>
                                                    {message.error && (
                                                        <p className="mt-1 max-w-xs truncate text-xs text-rose-500">
                                                            {message.error}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 text-sm text-slate-600">
                                                    {formatDateTime(message.sent_at ?? message.created_at)}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setPreview(message)}
                                                            title="عرض الرسالة"
                                                        >
                                                            <Eye className="h-4.5 w-4.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setDeleting(message)}
                                                            title="حذف"
                                                            className="hover:text-rose-600"
                                                        >
                                                            <Trash2 className="h-4.5 w-4.5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <Pagination paginator={messages} />
                        </>
                    )}
                </Card>
            </div>

            <Modal
                open={!!preview}
                onClose={() => setPreview(null)}
                title="نص الرسالة"
                description={preview ? `${preview.type_label} · ${formatDateTime(preview.sent_at ?? preview.created_at)}` : ''}
                size="md"
                footer={
                    <Button variant="secondary" onClick={() => setPreview(null)}>
                        إغلاق
                    </Button>
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
                open={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={confirmDelete}
                processing={processing}
                title="حذف السجل"
                message="سيتم حذف هذا السجل من سجل الرسائل. لا يمكن التراجع."
                confirmLabel="حذف"
            />
        </AuthenticatedLayout>
    );
}
