import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import PageHeader from '@/Components/PageHeader';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/ui/Button';
import { Card, CardBody, CardHeader } from '@/Components/ui/Card';
import { Field, Input, Select, Textarea } from '@/Components/ui/Field';
import { ageFromMonths } from '@/lib/utils';

export default function VaccineForm({ vaccine }) {
    const isEdit = !!vaccine;

    const { data, setData, post, put, processing, errors } = useForm({
        name: vaccine?.name ?? '',
        description: vaccine?.description ?? '',
        is_active: vaccine?.is_active ?? true,
        doses:
            vaccine?.doses?.map((dose) => ({
                id: dose.id,
                dose_number: dose.dose_number,
                age_in_months: dose.age_in_months,
                description: dose.description ?? '',
            })) ?? [{ id: null, dose_number: 1, age_in_months: 0, description: '' }],
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/vaccines/${vaccine.id}`);
        } else {
            post('/vaccines');
        }
    };

    const addDose = () => {
        setData('doses', [
            ...data.doses,
            {
                id: null,
                dose_number: data.doses.length + 1,
                age_in_months: 0,
                description: '',
            },
        ]);
    };

    const updateDose = (index, key, value) => {
        const doses = [...data.doses];
        doses[index] = { ...doses[index], [key]: value };
        setData('doses', doses);
    };

    const removeDose = (index) => {
        setData(
            'doses',
            data.doses.filter((_, i) => i !== index),
        );
    };

    return (
        <AuthenticatedLayout title={isEdit ? 'تعديل تطعيم' : 'إضافة تطعيم'}>
            <Head title={isEdit ? 'تعديل تطعيم' : 'إضافة تطعيم'} />

            <div className="space-y-6">
                <PageHeader
                    title={isEdit ? 'تعديل التطعيم' : 'إضافة تطعيم جديد'}
                    subtitle="حدّد اسم التطعيم وجرعاته المرتبطة بالأعمار."
                >
                    <Button as={Link} href="/vaccines" variant="secondary">
                        <ArrowRight className="h-4 w-4" />
                        رجوع للقائمة
                    </Button>
                </PageHeader>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader title="بيانات التطعيم" />
                        <CardBody className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <Field label="اسم التطعيم" required error={errors.name}>
                                <Input
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="مثال: الثلاثي البكتيري (DTP)"
                                    error={errors.name}
                                    autoFocus
                                />
                            </Field>

                            <Field label="الحالة">
                                <Select
                                    value={data.is_active ? '1' : '0'}
                                    onChange={(e) => setData('is_active', e.target.value === '1')}
                                >
                                    <option value="1">مُفعّل</option>
                                    <option value="0">غير مُفعّل</option>
                                </Select>
                            </Field>

                            <Field label="الوصف" error={errors.description} className="md:col-span-2">
                                <Textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    error={errors.description}
                                    rows={3}
                                    placeholder="وصف مختصر للتطعيم والفئة المستهدفة..."
                                />
                            </Field>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader
                            title="الجرعات"
                            subtitle="لكل جرعة عمر مستهدف بالأشهر لحساب موعد التطعيم."
                            action={
                                <Button variant="secondary" size="sm" onClick={addDose}>
                                    <Plus className="h-4 w-4" />
                                    إضافة جرعة
                                </Button>
                            }
                        />
                        <CardBody className="space-y-4">
                            {errors.doses && (
                                <p className="text-sm font-medium text-rose-600">{errors.doses}</p>
                            )}

                            {data.doses.map((dose, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-1 items-end gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-12"
                                >
                                    <Field label="رقم الجرعة" className="sm:col-span-2">
                                        <Input
                                            type="number"
                                            min="1"
                                            value={dose.dose_number}
                                            onChange={(e) =>
                                                updateDose(index, 'dose_number', Number(e.target.value))
                                            }
                                        />
                                    </Field>

                                    <Field
                                        label="العمر المستهدف (بالأشهر)"
                                        className="sm:col-span-3"
                                        error={errors[`doses.${index}.age_in_months`]}
                                        hint={ageFromMonths(Number(dose.age_in_months) || 0)}
                                    >
                                        <Input
                                            type="number"
                                            min="0"
                                            value={dose.age_in_months}
                                            onChange={(e) =>
                                                updateDose(index, 'age_in_months', Number(e.target.value))
                                            }
                                        />
                                    </Field>

                                    <Field label="ملاحظة" className="sm:col-span-5">
                                        <Input
                                            value={dose.description}
                                            onChange={(e) => updateDose(index, 'description', e.target.value)}
                                            placeholder="اختياري"
                                        />
                                    </Field>

                                    <div className="sm:col-span-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeDose(index)}
                                            disabled={data.doses.length === 1}
                                            className="hover:text-rose-600"
                                            title="حذف الجرعة"
                                        >
                                            <Trash2 className="h-4.5 w-4.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardBody>
                    </Card>

                    <div className="flex items-center justify-end gap-3">
                        <Button as={Link} href="/vaccines" variant="secondary" size="lg">
                            إلغاء
                        </Button>
                        <Button type="submit" size="lg" disabled={processing}>
                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {isEdit ? 'حفظ التعديلات' : 'إضافة التطعيم'}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
