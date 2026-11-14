import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BellRing,
    CalendarCheck,
    CheckCircle2,
    Loader2,
    MapPin,
    Pencil,
    Phone,
    RefreshCw,
    UserRound,
} from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/Components/PageHeader';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import { Card, CardBody, CardHeader } from '@/Components/ui/Card';
import { Field, Input } from '@/Components/ui/Field';
import Modal from '@/Components/ui/Modal';
import { formatDate, daysLabel, STATE_STYLES } from '@/lib/utils';

function InfoRow({ icon: Icon, label, value, ltr }) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <Icon className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm font-semibold text-slate-800" dir={ltr ? 'ltr' : undefined}>
                    {value || '—'}
                </p>
            </div>
        </div>
    );
}

export default function ChildShow({ child, vaccinations }) {
    const { flash } = usePage().props;
    const [marking, setMarking] = useState(null);
    const [givenDate, setGivenDate] = useState(new Date().toISOString().slice(0, 10));
    const [sendingId, setSendingId] = useState(null);
    const [syncing, setSyncing] = useState(false);

    const givenCount = vaccinations.filter((v) => v.given_date).length;
    const missedCount = vaccinations.filter((v) => v.state === 'missed').length;

    const sync = () => {
        setSyncing(true);
        router.get(`/children/${child.id}/vaccinations/sync`, {}, { onFinish: () => setSyncing(false) });
    };

    const openMark = (vaccination) => {
        setMarking(vaccination);
        setGivenDate(new Date().toISOString().slice(0, 10));
    };

    const submitMark = (e) => {
        e.preventDefault();
        router.put(
            `/vaccinations/${marking.id}`,
            { given_date: givenDate },
            { onFinish: () => setMarking(null), preserveScroll: true },
        );
    };

    const undo = (vaccination) => {
        router.put(`/vaccinations/${vaccination.id}`, { given_date: null }, { preserveScroll: true });
    };

    const sendReminder = (vaccination) => {
        setSendingId(vaccination.id);
        router.post(
            '/notifications/send',
            { vaccination_id: vaccination.id, type: vaccination.state === 'missed' ? 'missed' : 'reminder' },
            { preserveScroll: true, onFinish: () => setSendingId(null) },
        );
    };

    return (
        <AuthenticatedLayout title={child.full_name}>
            <Head title={child.full_name} />

            <div className="space-y-6">
                <PageHeader title={child.full_name} subtitle={`${child.gender_label} · ${child.age_label}`}>
                    <Button variant="secondary" onClick={sync} disabled={syncing}>
                        {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        مزامنة الجدول
                    </Button>
                    <Button as={Link} href={`/children/${child.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        تعديل
                    </Button>
                    <Button as={Link} href="/children" variant="ghost">
                        <ArrowRight className="h-4 w-4" />
                        رجوع
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-1">
                        <CardHeader title="بيانات الطفل" />
                        <CardBody className="space-y-4">
                            <InfoRow icon={UserRound} label="الاسم بالكامل" value={child.full_name} />
                            <InfoRow icon={CalendarCheck} label="تاريخ الميلاد" value={formatDate(child.birth_date)} />
                            <InfoRow icon={UserRound} label="النوع" value={child.gender_label} />
                            {child.national_id && (
                                <InfoRow icon={UserRound} label="الرقم القومي" value={child.national_id} ltr />
                            )}
                            <div className="border-t border-slate-100 pt-4">
                                <InfoRow icon={UserRound} label="ولي الأمر" value={child.parent_name} />
                            </div>
                            <InfoRow icon={Phone} label="هاتف ولي الأمر" value={child.parent_phone} ltr />
                            {child.alt_phone && <InfoRow icon={Phone} label="هاتف بديل" value={child.alt_phone} ltr />}
                            {child.address && <InfoRow icon={MapPin} label="العنوان" value={child.address} />}
                            <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
                                <Badge tone={child.is_active ? 'emerald' : 'slate'}>
                                    {child.is_active ? 'نشط' : 'غير نشط'}
                                </Badge>
                                {missedCount > 0 && <Badge tone="rose">{missedCount} تطعيم متأخر</Badge>}
                            </div>
                            {child.notes && (
                                <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                                    <p className="font-semibold">ملاحظات</p>
                                    <p className="mt-1 leading-relaxed">{child.notes}</p>
                                </div>
                            )}
                        </CardBody>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader
                            title="سجل التطعيمات"
                            subtitle={`${givenCount} من ${vaccinations.length} تطعيم مكتمل`}
                        />
                        {vaccinations.length === 0 ? (
                            <CardBody>
                                <p className="py-6 text-center text-sm text-slate-500">
                                    لا توجد تطعيمات مسجلة. اضغط على "مزامنة الجدول" لتوليد المواعيد.
                                </p>
                            </CardBody>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {vaccinations.map((vaccination) => {
                                    const style = STATE_STYLES[vaccination.state] ?? STATE_STYLES.upcoming;

                                    return (
                                        <div key={vaccination.id} className="flex items-center justify-between gap-4 px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">
                                                        {vaccination.vaccine_name}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                        الجرعة {vaccination.dose_number} · الموعد:{' '}
                                                        {formatDate(vaccination.due_date)}
                                                        {vaccination.given_date && (
                                                            <> · تم: {formatDate(vaccination.given_date)}</>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    tone={
                                                        vaccination.state === 'given'
                                                            ? 'emerald'
                                                            : vaccination.state === 'missed'
                                                              ? 'rose'
                                                              : vaccination.state === 'due'
                                                                ? 'amber'
                                                                : 'sky'
                                                    }
                                                >
                                                    {vaccination.given_date
                                                        ? 'تم التطعيم'
                                                        : vaccination.state === 'missed'
                                                          ? 'متأخر'
                                                          : daysLabel(vaccination.days_until_due)}
                                                </Badge>

                                                {vaccination.given_date ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => undo(vaccination)}
                                                        title="إلغاء التسجيل"
                                                    >
                                                        <RefreshCw className="h-4 w-4" />
                                                    </Button>
                                                ) : (
                                                    <>
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => sendReminder(vaccination)}
                                                            disabled={sendingId === vaccination.id}
                                                            title="إرسال تذكير واتساب"
                                                        >
                                                            {sendingId === vaccination.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <BellRing className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="success"
                                                            size="sm"
                                                            onClick={() => openMark(vaccination)}
                                                        >
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            تسجيل
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            <Modal
                open={!!marking}
                onClose={() => setMarking(null)}
                title="تسجيل إتمام التطعيم"
                description={marking ? `${marking.vaccine_name} — الجرعة ${marking.dose_number}` : ''}
                size="sm"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setMarking(null)}>
                            إلغاء
                        </Button>
                        <Button variant="success" onClick={submitMark}>
                            <CheckCircle2 className="h-4 w-4" />
                            تأكيد
                        </Button>
                    </>
                }
            >
                <form onSubmit={submitMark}>
                    <Field label="تاريخ إعطاء التطعيم" required>
                        <Input type="date" value={givenDate} onChange={(e) => setGivenDate(e.target.value)} />
                    </Field>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
