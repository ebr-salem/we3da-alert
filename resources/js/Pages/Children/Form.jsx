import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, Loader2, Save } from 'lucide-react';
import PageHeader from '@/Components/PageHeader';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/ui/Button';
import { Card, CardBody, CardHeader } from '@/Components/ui/Card';
import { Field, Input, Select, Textarea } from '@/Components/ui/Field';

export default function ChildForm({ child }) {
    const isEdit = !!child;

    const { data, setData, post, put, processing, errors } = useForm({
        full_name: child?.full_name ?? '',
        birth_date: child?.birth_date ?? '',
        gender: child?.gender ?? 'male',
        national_id: child?.national_id ?? '',
        parent_name: child?.parent_name ?? '',
        parent_phone: child?.parent_phone ?? '',
        alt_phone: child?.alt_phone ?? '',
        address: child?.address ?? '',
        notes: child?.notes ?? '',
        is_active: child?.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/children/${child.id}`);
        } else {
            post('/children');
        }
    };

    return (
        <AuthenticatedLayout title={isEdit ? 'تعديل بيانات طفل' : 'إضافة طفل'}>
            <Head title={isEdit ? 'تعديل بيانات طفل' : 'إضافة طفل'} />

            <div className="space-y-6">
                <PageHeader
                    title={isEdit ? 'تعديل بيانات الطفل' : 'إضافة طفل جديد'}
                    subtitle="أدخل البيانات الأساسية للطفل وولي الأمر."
                >
                    <Button as={Link} href="/children" variant="secondary">
                        <ArrowRight className="h-4 w-4" />
                        رجوع للقائمة
                    </Button>
                </PageHeader>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader title="بيانات الطفل" />
                        <CardBody className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <Field label="اسم الطفل بالكامل" required error={errors.full_name} className="md:col-span-2">
                                <Input
                                    value={data.full_name}
                                    onChange={(e) => setData('full_name', e.target.value)}
                                    placeholder="مثال: أحمد محمد علي"
                                    error={errors.full_name}
                                    autoFocus
                                />
                            </Field>

                            <Field label="تاريخ الميلاد" required error={errors.birth_date}>
                                <Input
                                    type="date"
                                    value={data.birth_date}
                                    onChange={(e) => setData('birth_date', e.target.value)}
                                    error={errors.birth_date}
                                />
                            </Field>

                            <Field label="النوع" required error={errors.gender}>
                                <Select
                                    value={data.gender}
                                    onChange={(e) => setData('gender', e.target.value)}
                                    error={errors.gender}
                                >
                                    <option value="male">ذكر</option>
                                    <option value="female">أنثى</option>
                                </Select>
                            </Field>

                            <Field label="الرقم القومي" error={errors.national_id} hint="اختياري">
                                <Input
                                    value={data.national_id}
                                    onChange={(e) => setData('national_id', e.target.value)}
                                    error={errors.national_id}
                                />
                            </Field>

                            <Field label="الحالة" error={errors.is_active}>
                                <Select
                                    value={data.is_active ? '1' : '0'}
                                    onChange={(e) => setData('is_active', e.target.value === '1')}
                                >
                                    <option value="1">نشط</option>
                                    <option value="0">غير نشط</option>
                                </Select>
                            </Field>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader title="بيانات ولي الأمر والتواصل" />
                        <CardBody className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <Field label="اسم ولي الأمر" required error={errors.parent_name}>
                                <Input
                                    value={data.parent_name}
                                    onChange={(e) => setData('parent_name', e.target.value)}
                                    error={errors.parent_name}
                                />
                            </Field>

                            <Field
                                label="رقم هاتف ولي الأمر (واتساب)"
                                required
                                error={errors.parent_phone}
                                hint="سيتم استخدام هذا الرقم لإرسال تنبيهات التطعيم."
                            >
                                <Input
                                    value={data.parent_phone}
                                    onChange={(e) => setData('parent_phone', e.target.value)}
                                    placeholder="01xxxxxxxxx"
                                    dir="ltr"
                                    className="text-right"
                                    error={errors.parent_phone}
                                />
                            </Field>

                            <Field label="رقم هاتف بديل" error={errors.alt_phone} hint="اختياري">
                                <Input
                                    value={data.alt_phone}
                                    onChange={(e) => setData('alt_phone', e.target.value)}
                                    dir="ltr"
                                    className="text-right"
                                    error={errors.alt_phone}
                                />
                            </Field>

                            <Field label="العنوان" error={errors.address}>
                                <Input
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    error={errors.address}
                                />
                            </Field>

                            <Field label="ملاحظات" error={errors.notes} className="md:col-span-2">
                                <Textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    error={errors.notes}
                                    placeholder="أي ملاحظات طبية أو إدارية..."
                                />
                            </Field>
                        </CardBody>
                    </Card>

                    <div className="flex items-center justify-end gap-3">
                        <Button as={Link} href="/children" variant="secondary" size="lg">
                            إلغاء
                        </Button>
                        <Button type="submit" size="lg" disabled={processing}>
                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {isEdit ? 'حفظ التعديلات' : 'إضافة الطفل'}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
