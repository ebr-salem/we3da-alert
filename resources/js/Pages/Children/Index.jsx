import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, Trash2, UserRound, Users } from 'lucide-react';
import { useState } from 'react';
import ConfirmDialog from '@/Components/ConfirmDialog';
import PageHeader from '@/Components/PageHeader';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import { Card } from '@/Components/ui/Card';
import EmptyState from '@/Components/ui/EmptyState';
import { Field, Input, Select } from '@/Components/ui/Field';
import Pagination from '@/Components/ui/Pagination';
import { formatDate } from '@/lib/utils';

export default function ChildrenIndex({ children, filters }) {
    const [search, setSearch] = useState(filters.q ?? '');
    const [gender, setGender] = useState(filters.gender ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [deleting, setDeleting] = useState(null);
    const [processing, setProcessing] = useState(false);

    const applyFilters = (overrides = {}) => {
        router.get(
            '/children',
            {
                q: search,
                gender,
                status,
                ...overrides,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const submit = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const confirmDelete = () => {
        setProcessing(true);
        router.delete(`/children/${deleting.id}`, {
            onFinish: () => {
                setProcessing(false);
                setDeleting(null);
            },
        });
    };

    return (
        <AuthenticatedLayout title="الأطفال">
            <Head title="الأطفال" />

            <div className="space-y-6">
                <PageHeader title="سجل الأطفال" subtitle="إدارة بيانات الأطفال المسجلين بالوحدة الصحية.">
                    <Button as={Link} href="/children/create">
                        <Plus className="h-4 w-4" />
                        إضافة طفل
                    </Button>
                </PageHeader>

                <Card>
                    <form onSubmit={submit} className="grid grid-cols-1 gap-4 border-b border-slate-100 p-5 md:grid-cols-4">
                        <Field className="md:col-span-2">
                            <div className="relative">
                                <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="ابحث بالاسم أو رقم ولي الأمر أو تاريخ الميلاد..."
                                    className="pr-11"
                                />
                            </div>
                        </Field>
                        <Field>
                            <Select
                                value={gender}
                                onChange={(e) => {
                                    setGender(e.target.value);
                                    applyFilters({ gender: e.target.value });
                                }}
                            >
                                <option value="">كل الأنواع</option>
                                <option value="male">ذكر</option>
                                <option value="female">أنثى</option>
                            </Select>
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
                                <option value="active">نشط</option>
                                <option value="inactive">غير نشط</option>
                            </Select>
                        </Field>
                    </form>

                    {children.data.length === 0 ? (
                        <EmptyState
                            icon={Users}
                            title="لا يوجد أطفال"
                            description="ابدأ بإضافة بيانات الأطفال المسجلين بالوحدة الصحية."
                            action={
                                <Button as={Link} href="/children/create">
                                    <Plus className="h-4 w-4" />
                                    إضافة طفل
                                </Button>
                            }
                        />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-right">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-xs font-semibold uppercase text-slate-500">
                                            <th className="px-5 py-3">الطفل</th>
                                            <th className="px-5 py-3">العمر</th>
                                            <th className="px-5 py-3">ولي الأمر</th>
                                            <th className="px-5 py-3">التطعيمات</th>
                                            <th className="px-5 py-3">الحالة</th>
                                            <th className="px-5 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {children.data.map((child) => {
                                            const progress =
                                                child.total_vaccinations > 0
                                                    ? Math.round(
                                                          (child.given_vaccinations / child.total_vaccinations) *
                                                              100,
                                                      )
                                                    : 0;

                                            return (
                                                <tr key={child.id} className="transition hover:bg-slate-50/60">
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                                                                <UserRound className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <Link
                                                                    href={`/children/${child.id}`}
                                                                    className="font-bold text-slate-800 hover:text-brand-600"
                                                                >
                                                                    {child.full_name}
                                                                </Link>
                                                                <p className="text-xs text-slate-500">
                                                                    {child.gender_label} · {formatDate(child.birth_date)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-sm text-slate-600">
                                                        {child.age_label}
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <p className="text-sm font-medium text-slate-700">
                                                            {child.parent_name}
                                                        </p>
                                                        <p className="text-xs text-slate-500" dir="ltr">
                                                            {child.parent_phone}
                                                        </p>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                                                                <div
                                                                    className="h-full rounded-full bg-brand-500"
                                                                    style={{ width: `${progress}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-semibold text-slate-500">
                                                                {child.given_vaccinations}/{child.total_vaccinations}
                                                            </span>
                                                        </div>
                                                        {child.missed_vaccinations > 0 && (
                                                            <p className="mt-1 text-xs font-medium text-rose-600">
                                                                {child.missed_vaccinations} متأخر
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <Badge tone={child.is_active ? 'emerald' : 'slate'}>
                                                            {child.is_active ? 'نشط' : 'غير نشط'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button
                                                                as={Link}
                                                                href={`/children/${child.id}`}
                                                                variant="ghost"
                                                                size="icon"
                                                                title="عرض"
                                                            >
                                                                <Eye className="h-4.5 w-4.5" />
                                                            </Button>
                                                            <Button
                                                                as={Link}
                                                                href={`/children/${child.id}/edit`}
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
                                                                onClick={() => setDeleting(child)}
                                                                className="hover:text-rose-600"
                                                            >
                                                                <Trash2 className="h-4.5 w-4.5" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <Pagination paginator={children} />
                        </>
                    )}
                </Card>
            </div>

            <ConfirmDialog
                open={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={confirmDelete}
                processing={processing}
                title="حذف بيانات الطفل"
                message={`سيتم حذف بيانات الطفل "${deleting?.full_name}" وجميع سجلات التطعيمات الخاصة به. لا يمكن التراجع عن هذه العملية.`}
                confirmLabel="حذف"
            />
        </AuthenticatedLayout>
    );
}
