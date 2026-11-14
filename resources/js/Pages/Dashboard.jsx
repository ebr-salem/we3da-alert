import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    BellRing,
    CalendarClock,
    CheckCircle2,
    MessageCircle,
    Plus,
    Users,
} from 'lucide-react';
import PageHeader from '@/Components/PageHeader';
import StatCard from '@/Components/ui/StatCard';
import { Card, CardHeader } from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import EmptyState from '@/Components/ui/EmptyState';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { daysLabel, formatDate, STATE_STYLES } from '@/lib/utils';

function UpcomingRow({ item }) {
    const style = STATE_STYLES[item.state] ?? STATE_STYLES.upcoming;

    return (
        <div className="flex items-center justify-between gap-3 px-5 py-3.5">
            <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800">{item.child_name}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                    {item.vaccine_name} — الجرعة {item.dose_number}
                </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
                <Badge tone={item.state === 'due' ? 'amber' : 'sky'} dot={style.dot}>
                    {daysLabel(item.days_until_due)}
                </Badge>
                <span className="text-xs text-slate-400">{formatDate(item.due_date)}</span>
            </div>
        </div>
    );
}

function OverdueRow({ item }) {
    return (
        <div className="flex items-center justify-between gap-3 px-5 py-3.5">
            <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800">{item.child_name}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                    {item.vaccine_name} — الجرعة {item.dose_number}
                </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
                <Badge tone="rose" dot="bg-rose-500">
                    متأخر {item.days_overdue} يوم
                </Badge>
                <span className="text-xs text-slate-400">{formatDate(item.due_date)}</span>
            </div>
        </div>
    );
}

export default function Dashboard({ stats, upcoming, overdue, monthly }) {
    const maxMonthly = Math.max(1, ...monthly.map((m) => m.given));

    return (
        <AuthenticatedLayout title="لوحة التحكم">
            <Head title="لوحة التحكم" />

            <div className="space-y-6">
                <PageHeader
                    title="لوحة التحكم"
                    subtitle="نظرة عامة على بيانات الأطفال ومواعيد التطعيمات."
                >
                    <Button as={Link} href="/children/create" variant="primary">
                        <Plus className="h-4 w-4" />
                        إضافة طفل
                    </Button>
                    <Button as={Link} href="/notifications" variant="secondary">
                        <BellRing className="h-4 w-4" />
                        الإشعارات
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        icon={Users}
                        tone="brand"
                        label="إجمالي الأطفال"
                        value={stats.children}
                        hint={`${stats.activeChildren} طفل نشط`}
                    />
                    <StatCard
                        icon={CalendarClock}
                        tone="amber"
                        label="تطعيمات مستحقة قريباً"
                        value={stats.dueSoon}
                        hint="خلال الأيام القادمة"
                    />
                    <StatCard
                        icon={AlertTriangle}
                        tone="rose"
                        label="تطعيمات متأخرة"
                        value={stats.missed}
                        hint="تحتاج متابعة"
                    />
                    <StatCard
                        icon={CheckCircle2}
                        tone="emerald"
                        label="تم تطعيمها هذا الشهر"
                        value={stats.givenThisMonth}
                        hint={`${stats.messagesThisMonth} رسالة مرسلة`}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <Card className="xl:col-span-2">
                        <CardHeader
                            title="التطعيمات القادمة"
                            subtitle="أقرب المواعيد المستحقة للأطفال"
                            action={
                                <Link
                                    href="/vaccinations?state=due"
                                    className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
                                >
                                    عرض الكل
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            }
                        />
                        {upcoming.length === 0 ? (
                            <EmptyState
                                icon={CalendarClock}
                                title="لا توجد مواعيد قادمة"
                                description="لا توجد تطعيمات مستحقة خلال الفترة القادمة."
                            />
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {upcoming.map((item) => (
                                    <UpcomingRow key={item.id} item={item} />
                                ))}
                            </div>
                        )}
                    </Card>

                    <Card>
                        <CardHeader
                            title="متابعة المتأخرين"
                            subtitle="أطفال لم يحصلوا على التطعيم"
                            action={
                                <Link
                                    href="/notifications?type=missed"
                                    className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-700"
                                >
                                    تنبيه
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            }
                        />
                        {overdue.length === 0 ? (
                            <EmptyState
                                icon={CheckCircle2}
                                title="لا يوجد متأخرون"
                                description="جميع الأطفال حصلوا على تطعيماتهم المستحقة."
                            />
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {overdue.map((item) => (
                                    <OverdueRow key={item.id} item={item} />
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                <Card>
                    <CardHeader
                        title="إحصائيات التطعيم الشهرية"
                        subtitle="عدد التطعيمات المكتملة خلال الأشهر الستة الماضية"
                    />
                    <div className="p-5">
                        <div className="flex items-end justify-between gap-3 sm:gap-6">
                            {monthly.map((month) => (
                                <div key={month.label} className="flex flex-1 flex-col items-center gap-2">
                                    <span className="text-sm font-bold text-slate-700">{month.given}</span>
                                    <div className="flex h-40 w-full items-end justify-center">
                                        <div
                                            className="w-full max-w-14 rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 transition-all"
                                            style={{
                                                height: `${Math.max(6, (month.given / maxMonthly) * 100)}%`,
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-slate-500">{month.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
