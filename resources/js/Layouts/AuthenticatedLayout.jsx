import { Link, usePage } from '@inertiajs/react';
import {
    BellRing,
    LayoutDashboard,
    LogOut,
    Menu,
    MessageSquareText,
    ShieldCheck,
    Syringe,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';
import FlashMessages from '@/Components/FlashMessages';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'لوحة التحكم', href: '/dashboard', icon: LayoutDashboard, match: 'dashboard' },
    { name: 'الأطفال', href: '/children', icon: Users, match: 'children' },
    { name: 'التطعيمات', href: '/vaccinations', icon: Syringe, match: 'vaccinations' },
    { name: 'قائمة التطعيمات', href: '/vaccines', icon: ShieldCheck, match: 'vaccines' },
    { name: 'الإشعارات', href: '/notifications', icon: BellRing, match: 'notifications' },
    { name: 'سجل الرسائل', href: '/messages', icon: MessageSquareText, match: 'messages' },
];

function NavLinks({ url, onNavigate }) {
    return (
        <nav className="flex-1 space-y-1 px-3">
            {navigation.map((item) => {
                const active = url.startsWith('/' + item.match);
                const Icon = item.icon;

                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                            'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                            active
                                ? 'bg-brand-600 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                        )}
                    >
                        <Icon
                            className={cn(
                                'h-5 w-5 shrink-0',
                                active ? 'text-white' : 'text-slate-400 group-hover:text-brand-600',
                            )}
                        />
                        {item.name}
                    </Link>
                );
            })}
        </nav>
    );
}

function SidebarContent({ url, user, onNavigate }) {
    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 px-5 py-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm">
                    <Syringe className="h-6 w-6" />
                </div>
                <div className="leading-tight">
                    <p className="text-base font-extrabold text-slate-900">تطعيمات الأطفال</p>
                    <p className="text-xs text-slate-500">الوحدة الصحية</p>
                </div>
            </div>

            <NavLinks url={url} onNavigate={onNavigate} />

            <div className="border-t border-slate-100 p-3">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                        {user?.name?.charAt(0) ?? 'م'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-800">{user?.name}</p>
                        <p className="truncate text-xs text-slate-500">
                            {user?.role === 'admin' ? 'مدير النظام' : 'موظف'}
                        </p>
                    </div>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-rose-600"
                        title="تسجيل الخروج"
                    >
                        <LogOut className="h-4.5 w-4.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function AuthenticatedLayout({ children, title }) {
    const { auth, url } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50">
            <FlashMessages />

            {/* Sidebar - desktop */}
            <aside className="fixed inset-y-0 right-0 z-30 hidden w-72 border-l border-slate-200 bg-white lg:block">
                <SidebarContent url={url} user={auth?.user} />
            </aside>

            {/* Sidebar - mobile */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside className="absolute inset-y-0 right-0 w-72 bg-white shadow-xl">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(false)}
                            className="absolute left-3 top-5 rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <SidebarContent url={url} user={auth?.user} onNavigate={() => setSidebarOpen(false)} />
                    </aside>
                </div>
            )}

            <div className="lg:pr-72">
                <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur lg:hidden">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <span className="font-bold text-slate-900">{title ?? 'لوحة التحكم'}</span>
                </header>

                <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
            </div>
        </div>
    );
}
