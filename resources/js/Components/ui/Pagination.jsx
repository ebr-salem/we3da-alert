import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Pagination({ paginator }) {
    if (!paginator || paginator.last_page <= 1) return null;

    const { links, current_page, last_page, from, to, total } = paginator;
    const pageLinks = links.slice(1, -1);

    return (
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row">
            <p className="text-sm text-slate-500">
                عرض <span className="font-semibold text-slate-700">{from ?? 0}</span> إلى{' '}
                <span className="font-semibold text-slate-700">{to ?? 0}</span> من{' '}
                <span className="font-semibold text-slate-700">{total}</span>
            </p>

            <nav className="flex items-center gap-1">
                {links[0].url ? (
                    <Link
                        href={links[0].url}
                        preserveScroll
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                ) : (
                    <span className="rounded-lg p-2 text-slate-300">
                        <ChevronRight className="h-4 w-4" />
                    </span>
                )}

                {pageLinks.map((link, index) => (
                    <Link
                        key={index}
                        href={link.url ?? '#'}
                        preserveScroll
                        className={cn(
                            'min-w-9 rounded-lg px-3 py-1.5 text-center text-sm font-semibold transition',
                            link.active
                                ? 'bg-brand-600 text-white'
                                : link.url
                                  ? 'text-slate-600 hover:bg-slate-100'
                                  : 'cursor-default text-slate-300',
                        )}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}

                {links[links.length - 1].url ? (
                    <Link
                        href={links[links.length - 1].url}
                        preserveScroll
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                ) : (
                    <span className="rounded-lg p-2 text-slate-300">
                        <ChevronLeft className="h-4 w-4" />
                    </span>
                )}
            </nav>
        </div>
    );
}
