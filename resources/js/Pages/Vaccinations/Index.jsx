import { Head, router } from '@inertiajs/react';
import {
    BellRing,
    CheckCircle2,
    Loader2,
    Plus,
    RefreshCw,
    Search,
    Syringe,
    Trash2,
} from 'lucide-react';
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
import { daysLabel, formatDate } from '@/lib/utils';

const stateTone = {
    given: 'emerald',
    due: 'amber',
    upcoming: 'sky',
    missed: 'rose',
};

export default function VaccinationsIndex({ vaccinations, filters, vaccines, children }) {
    const [search, setSearch] = useState(filters.q ?? '');
    const [state, setState] = useState(filters.state ?? '');
    const [vaccineId, setVaccineId] = useState(filters.vaccine_id ?? '');

    const [marking, setMarking] = useState(null);
    const [givenDate, setGivenDate] = useState(new Date().toISOString().slice(0, 10));
    const [deleting, setDeleting] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [sendingId, setSendingId] = useState(null);

    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({
        child_id: '',
        vaccine_id: '',
        dose_number: 1,
        due_date: '',
        given_date: '',
    });

    const applyFilters = (overrides = {}) => {
        router.get(
            '/vaccinations',
            { q: search, state, vaccine_id: vaccineId, ...overrides },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const submitSearch = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const submitMark = (e) => {
        e.preventDefault();
        router.put(
            `/vaccinations/${marking.id}`,
            { given_date: givenDate },
            { preserveScroll: true, onFinish: () => setMarking(null) },
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

    const confirmDelete = () => {
        setProcessing(true);
        router.delete(`/vaccinations/${deleting.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setDeleting(null);
            },
        });
    };

    const submitCreate = (e) => {
        e.preventDefault();
        router.post('/vaccinations', form, {
            preserveScroll: true,
            onSuccess: () => {
                setShowCreate(false);
                setForm({ child_id: '', vaccine_id: '', dose_number: 1, due_date: '', given_date: '' });
            },
        });
    };

    return (
        <AuthenticatedLayout title="التطعيمات">
            <Head title="التطعيمات" />

            <div className="space-y-6">
                <PageHeader title="متابعة التطعيمات" subtitle="جميع مواعيد التطعيمات المسجلة للأطفال.">
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="h-4 w-4" />
                        إضافة موعد
                    </Button>
                </PageHeader>

                <Card>
                    <form
                        onSubmit={submitSearch}
                        className="grid grid-cols-1 gap-4 border-b border-slate-100 p-5 md:grid-cols-4"
                    >
                        <Field className="md:col-span-2">
                            <div className="relative">
                                <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="ابحث باسم الطفل أو ولي الأمر..."
                                    className="pr-11"
                                />
                            </div>
                        </Field>
                        <Field>
                            <Select
                                value={state}
                                onChange={(e) => {
                                    setState(e.target.value);
                                    applyFilters({ state: e.target.value });
                                }}
                            >
                                <option value="">كل الحالات</option>
                                <option value="due">مستحق قريباً</option>
                                <option value="missed">متأخر</option>
                                <option value="given">تم التطعيم</option>
                                <option value="upcoming">قادم</option>
                            </Select>
                        </Field>
                        <Field>
                            <Select
                                value={vaccineId}
                                onChange={(e) => {
                                    setVaccineId(e.target.value);
                                    applyFilters({ vaccine_id: e.target.value });
                                }}
                            >
                                <option value="">كل التطعيمات</option>
                                {vaccines.map((vaccine) => (
                                    <option key={vaccine.id} value={vaccine.id}>
                                        {vaccine.name}
                                    </option>
                                ))}
                            </Select>
                        </Field>
                    </form>

                    {vaccinations.data.length === 0 ? (
                        <EmptyState
                            icon={Syringe}
                            title="لا توجد تطعيمات"
                            description="لا توجد مواعيد تطعيم مطابقة للبحث."
                        />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-right">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-xs font-semibold uppercase text-slate-500">
                                            <th className="px-5 py-3">الطفل</th>
                                            <th className="px-5 py-3">التطعيم</th>
                                            <th className="px-5 py-3">الموعد</th>
                                            <th className="px-5 py-3">الحالة</th>
                                            <th className="px-5 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {vaccinations.data.map((vaccination) => (
                                            <tr key={vaccination.id} className="transition hover:bg-slate-50/60">
                                                <td className="px-5 py-3.5">
                                                    <p className="text-sm font-bold text-slate-800">
                                                        {vaccination.child_name}
                                                    </p>
                                                    <p className="text-xs text-slate-500" dir="ltr">
                                                        {vaccination.parent_phone}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <p className="text-sm font-medium text-slate-700">
                                                        {vaccination.vaccine_name}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        الجرعة {vaccination.dose_number}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <p className="text-sm text-slate-600">
                                                        {formatDate(vaccination.due_date)}
                                                    </p>
                                                    {vaccination.given_date && (
                                                        <p className="text-xs text-emerald-600">
                                                            تم: {formatDate(vaccination.given_date)}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <Badge tone={stateTone[vaccination.state]}>
                                                        {vaccination.given_date
                                                            ? 'تم التطعيم'
                                                            : vaccination.state === 'missed'
                                                              ? 'متأخر'
                                                              : daysLabel(vaccination.days_until_due)}
                                                    </Badge>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {vaccination.given_date ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => undo(vaccination)}
                                                                title="إلغاء التسجيل"
                                                            >
                                                                <RefreshCw className="h-4.5 w-4.5" />
                                                            </Button>
                                                        ) : (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => sendReminder(vaccination)}
                                                                    disabled={sendingId === vaccination.id}
                                                                    title="إرسال تذكير"
                                                                >
                                                                    {sendingId === vaccination.id ? (
                                                                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                                                                    ) : (
                                                                        <BellRing className="h-4.5 w-4.5" />
                                                                    )}
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => {
                                                                        setMarking(vaccination);
                                                                        setGivenDate(
                                                                            new Date().toISOString().slice(0, 10),
                                                                        );
                                                                    }}
                                                                    title="تسجيل التطعيم"
                                                                    className="hover:text-emerald-600"
                                                                >
                                                                    <CheckCircle2 className="h-4.5 w-4.5" />
                                                                </Button>
                                                            </>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setDeleting(vaccination)}
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

                            <Pagination paginator={vaccinations} />
                        </>
                    )}
                </Card>
            </div>

            <Modal
                open={!!marking}
                onClose={() => setMarking(null)}
                title="تسجيل إتمام التطعيم"
                description={marking ? `${marking.child_name} — ${marking.vaccine_name}` : ''}
                size="sm"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setMarking(null)}>
                            إلغاء
                        </Button>
                        <Button variant="success" onClick={submitMark}>
                            تأكيد
                        </Button>
                    </>
                }
            >
                <Field label="تاريخ إعطاء التطعيم" required>
                    <Input type="date" value={givenDate} onChange={(e) => setGivenDate(e.target.value)} />
                </Field>
            </Modal>

            <Modal
                open={showCreate}
                onClose={() => setShowCreate(false)}
                title="إضافة موعد تطعيم"
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowCreate(false)}>
                            إلغاء
                        </Button>
                        <Button onClick={submitCreate}>
                            <Plus className="h-4 w-4" />
                            حفظ
                        </Button>
                    </>
                }
            >
                <form onSubmit={submitCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="الطفل" required className="sm:col-span-2">
                        <Select
                            value={form.child_id}
                            onChange={(e) => setForm({ ...form, child_id: e.target.value })}
                            required
                        >
                            <option value="">اختر الطفل</option>
                            {children.map((child) => (
                                <option key={child.id} value={child.id}>
                                    {child.full_name}
                                </option>
                            ))}
                        </Select>
                    </Field>
                    <Field label="التطعيم" required>
                        <Select
                            value={form.vaccine_id}
                            onChange={(e) => setForm({ ...form, vaccine_id: e.target.value })}
                            required
                        >
                            <option value="">اختر التطعيم</option>
                            {vaccines.map((vaccine) => (
                                <option key={vaccine.id} value={vaccine.id}>
                                    {vaccine.name}
                                </option>
                            ))}
                        </Select>
                    </Field>
                    <Field label="رقم الجرعة" required>
                        <Input
                            type="number"
                            min="1"
                            value={form.dose_number}
                            onChange={(e) => setForm({ ...form, dose_number: e.target.value })}
                            required
                        />
                    </Field>
                    <Field label="تاريخ الاستحقاق" required>
                        <Input
                            type="date"
                            value={form.due_date}
                            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                            required
                        />
                    </Field>
                    <Field label="تاريخ الإعطاء" hint="اتركه فارغاً إذا لم يُعطَ بعد">
                        <Input
                            type="date"
                            value={form.given_date}
                            onChange={(e) => setForm({ ...form, given_date: e.target.value })}
                        />
                    </Field>
                </form>
            </Modal>

            <ConfirmDialog
                open={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={confirmDelete}
                processing={processing}
                title="حذف موعد التطعيم"
                message={`سيتم حذف موعد "${deleting?.vaccine_name}" للطفل "${deleting?.child_name}".`}
                confirmLabel="حذف"
            />
        </AuthenticatedLayout>
    );
}
