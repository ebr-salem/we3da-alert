<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\Vaccination;
use App\Models\Vaccine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VaccinationController extends Controller
{
    public function index(Request $request): Response
    {
        $reminderDays = (int) config('services.vaccination.reminder_days', 7);

        $filters = [
            'q' => $request->string('q')->toString(),
            'state' => $request->string('state')->toString(),
            'vaccine_id' => $request->string('vaccine_id')->toString(),
        ];

        $query = Vaccination::query()
            ->with(['child:id,full_name,parent_name,parent_phone', 'vaccine:id,name'])
            ->when($filters['q'], function ($q, $term) {
                $q->whereHas('child', fn ($c) => $c->where('full_name', 'like', "%{$term}%")
                    ->orWhere('parent_name', 'like', "%{$term}%")
                    ->orWhere('parent_phone', 'like', "%{$term}%"));
            })
            ->when($filters['vaccine_id'], fn ($q, $id) => $q->where('vaccine_id', $id))
            ->when($filters['state'] === 'given', fn ($q) => $q->whereNotNull('given_date'))
            ->when($filters['state'] === 'missed', fn ($q) => $q->missed())
            ->when($filters['state'] === 'due', fn ($q) => $q->whereNull('given_date')
                ->whereDate('due_date', '>=', now()->toDateString())
                ->whereDate('due_date', '<=', now()->addDays($reminderDays)->toDateString()))
            ->when($filters['state'] === 'upcoming', fn ($q) => $q->whereNull('given_date')
                ->whereDate('due_date', '>', now()->addDays($reminderDays)->toDateString()))
            ->orderByRaw('given_date IS NULL DESC')
            ->orderBy('due_date');

        $vaccinations = $query->paginate(15)->withQueryString()->through(fn (Vaccination $v) => [
            'id' => $v->id,
            'child_id' => $v->child_id,
            'child_name' => $v->child->full_name,
            'parent_name' => $v->child->parent_name,
            'parent_phone' => $v->child->parent_phone,
            'vaccine_id' => $v->vaccine_id,
            'vaccine_name' => $v->vaccine->name,
            'dose_number' => $v->dose_number,
            'due_date' => $v->due_date->toDateString(),
            'given_date' => $v->given_date?->toDateString(),
            'status' => $v->status,
            'state' => $v->state,
            'state_label' => $v->state_label,
            'days_until_due' => $v->days_until_due,
        ]);

        return Inertia::render('Vaccinations/Index', [
            'vaccinations' => $vaccinations,
            'filters' => $filters,
            'vaccines' => Vaccine::orderBy('name')->get(['id', 'name']),
            'children' => Child::orderBy('full_name')->get(['id', 'full_name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'child_id' => ['required', 'exists:children,id'],
            'vaccine_id' => ['required', 'exists:vaccines,id'],
            'dose_number' => ['required', 'integer', 'min:1'],
            'due_date' => ['required', 'date'],
            'given_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        Vaccination::updateOrCreate(
            [
                'child_id' => $data['child_id'],
                'vaccine_id' => $data['vaccine_id'],
                'dose_number' => $data['dose_number'],
            ],
            [
                'due_date' => $data['due_date'],
                'given_date' => $data['given_date'] ?? null,
                'notes' => $data['notes'] ?? null,
            ],
        );

        return back()->with('success', 'تم حفظ موعد التطعيم.');
    }

    public function update(Request $request, Vaccination $vaccination): RedirectResponse
    {
        $data = $request->validate([
            'due_date' => ['sometimes', 'date'],
            'given_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $vaccination->update($data);

        return back()->with('success', 'تم تحديث بيانات التطعيم.');
    }

    public function destroy(Vaccination $vaccination): RedirectResponse
    {
        $vaccination->delete();

        return back()->with('success', 'تم حذف موعد التطعيم.');
    }
}
