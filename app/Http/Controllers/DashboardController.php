<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\Message;
use App\Models\Vaccination;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $reminderDays = (int) config('services.vaccination.reminder_days', 7);

        $stats = [
            'children' => Child::count(),
            'activeChildren' => Child::where('is_active', true)->count(),
            'dueSoon' => Vaccination::whereNull('given_date')
                ->whereDate('due_date', '>=', now()->toDateString())
                ->whereDate('due_date', '<=', now()->addDays($reminderDays)->toDateString())
                ->count(),
            'missed' => Vaccination::missed()->count(),
            'givenThisMonth' => Vaccination::whereNotNull('given_date')
                ->whereMonth('given_date', now()->month)
                ->whereYear('given_date', now()->year)
                ->count(),
            'messagesThisMonth' => Message::where('status', Message::STATUS_SENT)
                ->whereMonth('sent_at', now()->month)
                ->whereYear('sent_at', now()->year)
                ->count(),
        ];

        $upcoming = Vaccination::with(['child:id,full_name,parent_name,parent_phone', 'vaccine:id,name'])
            ->whereNull('given_date')
            ->whereDate('due_date', '>=', now()->toDateString())
            ->orderBy('due_date')
            ->limit(8)
            ->get()
            ->map(fn (Vaccination $v) => [
                'id' => $v->id,
                'child_name' => $v->child->full_name,
                'parent_name' => $v->child->parent_name,
                'vaccine_name' => $v->vaccine->name,
                'dose_number' => $v->dose_number,
                'due_date' => $v->due_date->toDateString(),
                'days_until_due' => $v->days_until_due,
                'state' => $v->state,
            ]);

        $overdue = Vaccination::with(['child:id,full_name,parent_name,parent_phone', 'vaccine:id,name'])
            ->missed()
            ->orderBy('due_date')
            ->limit(8)
            ->get()
            ->map(fn (Vaccination $v) => [
                'id' => $v->id,
                'child_name' => $v->child->full_name,
                'parent_name' => $v->child->parent_name,
                'vaccine_name' => $v->vaccine->name,
                'dose_number' => $v->dose_number,
                'due_date' => $v->due_date->toDateString(),
                'days_overdue' => abs($v->days_until_due),
                'state' => $v->state,
            ]);

        $monthly = collect(range(5, 0))->map(function ($i) {
            $date = Carbon::now()->subMonths($i);
            $label = $date->translatedFormat('M Y');

            return [
                'label' => $label,
                'given' => Vaccination::whereNotNull('given_date')
                    ->whereMonth('given_date', $date->month)
                    ->whereYear('given_date', $date->year)
                    ->count(),
            ];
        });

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'upcoming' => $upcoming,
            'overdue' => $overdue,
            'monthly' => $monthly,
        ]);
    }
}
