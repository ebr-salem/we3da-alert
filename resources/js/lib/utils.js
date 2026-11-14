import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatDate(value) {
    if (!value) return '—';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '—';

    return new Intl.DateTimeFormat('ar-EG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
}

export function formatShortDate(value) {
    if (!value) return '—';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '—';

    return new Intl.DateTimeFormat('ar-EG', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

export function formatDateTime(value) {
    if (!value) return '—';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '—';

    return new Intl.DateTimeFormat('ar-EG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

export function daysLabel(days) {
    if (days === 0) return 'اليوم';
    if (days === 1) return 'غداً';
    if (days > 1) return `بعد ${days} يوم`;
    if (days === -1) return 'منذ يوم';
    return `منذ ${Math.abs(days)} يوم`;
}

export function ageFromMonths(months) {
    if (months === 0) return 'عند الولادة';
    if (months < 12) return `${months} شهر`;

    const years = Math.floor(months / 12);
    const remaining = months % 12;

    if (remaining === 0) return years === 1 ? 'سنة' : `${years} سنوات`;
    return `${years} سنة و${remaining} شهر`;
}

export const STATE_STYLES = {
    given: {
        label: 'تم التطعيم',
        badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        dot: 'bg-emerald-500',
    },
    due: {
        label: 'مستحق الآن',
        badge: 'bg-amber-50 text-amber-700 ring-amber-600/20',
        dot: 'bg-amber-500',
    },
    upcoming: {
        label: 'قادم',
        badge: 'bg-sky-50 text-sky-700 ring-sky-600/20',
        dot: 'bg-sky-500',
    },
    missed: {
        label: 'متأخر',
        badge: 'bg-rose-50 text-rose-700 ring-rose-600/20',
        dot: 'bg-rose-500',
    },
};
