<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\Vaccination;
use App\Services\VaccinationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ChildController extends Controller
{
    public function __construct(protected VaccinationService $vaccinations) {}

    public function index(Request $request): Response
    {
        $filters = [
            'q' => $request->string('q')->toString(),
            'gender' => $request->string('gender')->toString(),
            'status' => $request->string('status')->toString(),
        ];

        $children = Child::query()
            ->search($filters['q'])
            ->when($filters['gender'], fn ($q, $gender) => $q->where('gender', $gender))
            ->when($filters['status'] === 'active', fn ($q) => $q->where('is_active', true))
            ->when($filters['status'] === 'inactive', fn ($q) => $q->where('is_active', false))
            ->withCount([
                'vaccinations as total_vaccinations',
                'vaccinations as given_vaccinations' => fn ($q) => $q->whereNotNull('given_date'),
                'vaccinations as missed_vaccinations' => fn ($q) => $q->whereNull('given_date')->whereDate('due_date', '<', now()),
            ])
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Child $child) => [
                'id' => $child->id,
                'full_name' => $child->full_name,
                'birth_date' => $child->birth_date->toDateString(),
                'age_label' => $child->age_label,
                'gender' => $child->gender,
                'gender_label' => $child->gender_label,
                'parent_name' => $child->parent_name,
                'parent_phone' => $child->parent_phone,
                'is_active' => $child->is_active,
                'total_vaccinations' => $child->total_vaccinations,
                'given_vaccinations' => $child->given_vaccinations,
                'missed_vaccinations' => $child->missed_vaccinations,
            ]);

        return Inertia::render('Children/Index', [
            'children' => $children,
            'filters' => $filters,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Children/Form', [
            'child' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        $child = Child::create($data);

        $created = $this->vaccinations->syncChild($child);

        return redirect()->route('children.show', $child)
            ->with('success', "تم إضافة الطفل بنجاح، وتم توليد {$created} موعد تطعيم من الجدول.");
    }

    public function show(Child $child): Response
    {
        $child->load(['vaccinations' => fn ($q) => $q->with('vaccine')->orderBy('due_date')]);

        $vaccinations = $child->vaccinations->map(fn (Vaccination $v) => [
            'id' => $v->id,
            'vaccine_name' => $v->vaccine->name,
            'dose_number' => $v->dose_number,
            'due_date' => $v->due_date->toDateString(),
            'given_date' => $v->given_date?->toDateString(),
            'status' => $v->status,
            'state' => $v->state,
            'state_label' => $v->state_label,
            'days_until_due' => $v->days_until_due,
        ]);

        return Inertia::render('Children/Show', [
            'child' => [
                'id' => $child->id,
                'full_name' => $child->full_name,
                'birth_date' => $child->birth_date->toDateString(),
                'age_label' => $child->age_label,
                'gender' => $child->gender,
                'gender_label' => $child->gender_label,
                'national_id' => $child->national_id,
                'parent_name' => $child->parent_name,
                'parent_phone' => $child->parent_phone,
                'alt_phone' => $child->alt_phone,
                'address' => $child->address,
                'notes' => $child->notes,
                'is_active' => $child->is_active,
            ],
            'vaccinations' => $vaccinations,
        ]);
    }

    public function edit(Child $child): Response
    {
        return Inertia::render('Children/Form', [
            'child' => [
                'id' => $child->id,
                'full_name' => $child->full_name,
                'birth_date' => $child->birth_date->toDateString(),
                'gender' => $child->gender,
                'national_id' => $child->national_id,
                'parent_name' => $child->parent_name,
                'parent_phone' => $child->parent_phone,
                'alt_phone' => $child->alt_phone,
                'address' => $child->address,
                'notes' => $child->notes,
                'is_active' => $child->is_active,
            ],
        ]);
    }

    public function update(Request $request, Child $child): RedirectResponse
    {
        $child->update($this->validated($request));

        $this->vaccinations->syncChild($child);

        return redirect()->route('children.show', $child)
            ->with('success', 'تم تحديث بيانات الطفل بنجاح.');
    }

    public function destroy(Child $child): RedirectResponse
    {
        $child->delete();

        return redirect()->route('children.index')
            ->with('success', 'تم حذف بيانات الطفل.');
    }

    public function sync(Child $child): RedirectResponse
    {
        $created = $this->vaccinations->syncChild($child);

        return back()->with('success', "تم تحديث جدول التطعيمات ({$created} موعد جديد).");
    }

    /**
     * @return array<string, mixed>
     */
    protected function validated(Request $request): array
    {
        return $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'birth_date' => ['required', 'date', 'before_or_equal:today'],
            'gender' => ['required', Rule::in(['male', 'female'])],
            'national_id' => ['nullable', 'string', 'max:20'],
            'parent_name' => ['required', 'string', 'max:255'],
            'parent_phone' => ['required', 'string', 'max:20'],
            'alt_phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['boolean'],
        ], [], [
            'full_name' => 'اسم الطفل',
            'birth_date' => 'تاريخ الميلاد',
            'gender' => 'النوع',
            'national_id' => 'الرقم القومي',
            'parent_name' => 'اسم ولي الأمر',
            'parent_phone' => 'رقم هاتف ولي الأمر',
            'alt_phone' => 'رقم هاتف بديل',
            'address' => 'العنوان',
            'notes' => 'ملاحظات',
        ]);
    }
}
