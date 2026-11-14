import { Head, useForm } from '@inertiajs/react';
import { Loader2, Lock, Mail, Syringe } from 'lucide-react';
import Button from '@/Components/ui/Button';
import { Field, Input } from '@/Components/ui/Field';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="تسجيل الدخول" />

            <div className="flex min-h-screen bg-slate-50">
                <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-brand-700 p-12 text-white lg:flex">
                    <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand-600/60" />
                    <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-brand-800/60" />

                    <div className="relative flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                            <Syringe className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-lg font-extrabold">نظام تطعيمات الأطفال</p>
                            <p className="text-sm text-brand-100">الوحدة الصحية</p>
                        </div>
                    </div>

                    <div className="relative max-w-md">
                        <h2 className="text-3xl font-extrabold leading-snug">
                            تنظيم بيانات الأطفال ومتابعة مواعيد التطعيمات بسهولة
                        </h2>
                        <p className="mt-4 text-brand-100 leading-relaxed">
                            إدارة بيانات الأطفال، متابعة التطعيمات المستحقة، وإرسال التنبيهات تلقائياً إلى
                            أولياء الأمور عبر واتساب.
                        </p>
                    </div>

                    <p className="relative text-sm text-brand-200">
                        © {new Date().getFullYear()} الوحدة الصحية. جميع الحقوق محفوظة.
                    </p>
                </div>

                <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
                    <div className="w-full max-w-sm">
                        <div className="mb-8 text-center lg:hidden">
                            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white">
                                <Syringe className="h-7 w-7" />
                            </div>
                            <p className="text-lg font-extrabold text-slate-900">نظام تطعيمات الأطفال</p>
                        </div>

                        <h1 className="text-2xl font-extrabold text-slate-900">تسجيل الدخول</h1>
                        <p className="mt-1.5 text-sm text-slate-500">
                            الرجاء إدخال بيانات حسابك للوصول إلى لوحة التحكم.
                        </p>

                        <form onSubmit={submit} className="mt-8 space-y-5">
                            <Field label="البريد الإلكتروني" required error={errors.email}>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute right-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="pr-11"
                                        placeholder="admin@we7da.test"
                                        autoComplete="username"
                                        autoFocus
                                        error={errors.email}
                                    />
                                </div>
                            </Field>

                            <Field label="كلمة المرور" required error={errors.password}>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute right-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="pr-11"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        error={errors.password}
                                    />
                                </div>
                            </Field>

                            <label className="flex items-center gap-2.5 text-sm text-slate-600">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-600"
                                />
                                تذكرني على هذا الجهاز
                            </label>

                            <Button type="submit" size="lg" className="w-full" disabled={processing}>
                                {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                                دخول
                            </Button>
                        </form>

                        <div className="mt-8 rounded-xl bg-slate-100 p-4 text-xs text-slate-500 leading-relaxed">
                            <p className="font-semibold text-slate-600">بيانات الدخول التجريبية:</p>
                            <p className="mt-1">البريد: admin@we7da.test — كلمة المرور: password</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
