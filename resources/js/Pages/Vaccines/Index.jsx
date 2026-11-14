import { Head, Link, router } from '@inertiajs/react';
import { CalendarClock, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ConfirmDialog from '@/Components/ConfirmDialog';
import PageHeader from '@/Components/PageHeader';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import { Card, CardBody, CardHeader } from '@/Components/ui/Card';
import EmptyState from '@/Components/ui/EmptyState';

export default function VaccinesIndex({ vaccines }) {
    const [deleting, setDeleting] = useState(null);
    const [processing, setProcessing] = useState(false);

    const confirmDelete = () => {
        setProcessing(true);
        router.delete(`/vaccines/${deleting.id}`, {
            onFinish: () => {
                setProcessing(false);
                setDeleting(null);
            },
        });
    };

    return (
        <AuthenticatedLayout title="قائمة التطعيمات">
            <Head title="قائمة التطعيمات" />

            <div className="space-y-6">
                <PageHeader
                    title="قائمة التطعيمات"
                    subtitle="إدارة جدول التطعيمات المعتمد وربط كل جرعة بالفئة العمرية."
                >
                    <Button as={Link} href="/vaccines/create">
                        <Plus className="h-4 w-4" />
                        إضافة تطعيم
                    </Button>
                </PageHeader>

                {vaccines.length === 0 ? (
                    <Card>
                        <EmptyState
                            icon={ShieldCheck}
                            title="لا توجد تطعيمات"
                            description="أضف التطعيمات المعتمدة في الوحدة الصحية لربطها بأعمار الأطفال."
                            action={
                                <Button as={Link} href="/vaccines/create">
                                    <Plus className="h-4 w-4" />
                                    إضافة تطعيم
                                </Button>
                            }
                        />
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {vaccines.map((vaccine) => (
                            <Card key={vaccine.id}>
                                <CardHeader
                                    title={vaccine.name}
                                    subtitle={vaccine.description}
                                    action={
                                        <div className="flex items-center gap-1">
                                            <Button
                                                as={Link}
                                                href={`/vaccines/${vaccine.id}/edit`}
                                                variant="ghost"
                                                size="icon"
                                                title="تعديل"
                                            >
                                                <Pencil className="h-4.5 w-4.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="حذف"
                                                onClick={() => setDeleting(vaccine)}
                                                className="hover:text-rose-600"
                                            >
                                                <Trash2 className="h-4.5 w-4.5" />
                                            </Button>
                                        </div>
                                    }
                                />
                                <CardBody>
                                    <div className="mb-4 flex flex-wrap items-center gap-2">
                                        <Badge tone={vaccine.is_active ? 'emerald' : 'slate'}>
                                            {vaccine.is_active ? 'مُفعّل' : 'غير مُفعّل'}
                                        </Badge>
                                        <Badge tone="brand">{vaccine.doses.length} جرعة</Badge>
                                        <Badge tone="sky">{vaccine.vaccinations_count} سجل تطعيم</Badge>
                                    </div>

                                    <div className="space-y-2">
                                        {vaccine.doses.map((dose) => (
                                            <div
                                                key={dose.id}
                                                className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5"
                                            >
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-bold text-brand-600 ring-1 ring-slate-200">
                                                    {dose.dose_number}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-slate-700">
                                                        الجرعة {dose.dose_number}
                                                    </p>
                                                    {dose.description && (
                                                        <p className="text-xs text-slate-500">{dose.description}</p>
                                                    )}
                                                </div>
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
                                                    <CalendarClock className="h-3.5 w-3.5 text-slate-400" />
                                                    {dose.age_label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={confirmDelete}
                processing={processing}
                title="حذف التطعيم"
                message={`سيتم حذف "${deleting?.name}" وجميع جرعاته وسجلاته المرتبطة. لا يمكن التراجع.`}
                confirmLabel="حذف"
            />
        </AuthenticatedLayout>
    );
}
