<?php

namespace App\Http\Controllers;

use App\Models\Vaccine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VaccineController extends Controller
{
    public function index(): Response
    {
        $vaccines = Vaccine::with('doses')
            ->withCount('vaccinations')
            ->orderBy('name')
            ->get()
            ->map(fn (Vaccine $vaccine) => [
                'id' => $vaccine->id,
                'name' => $vaccine->name,
                'description' => $vaccine->description,
                'is_active' => $vaccine->is_active,
                'vaccinations_count' => $vaccine->vaccinations_count,
                'doses' => $vaccine->doses->map(fn ($dose) => [
                    'id' => $dose->id,
                    'dose_number' => $dose->dose_number,
                    'age_in_months' => $dose->age_in_months,
                    'age_label' => $dose->age_label,
                    'description' => $dose->description,
                ]),
            ]);

        return Inertia::render('Vaccines/Index', [
            'vaccines' => $vaccines,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Vaccines/Form', [
            'vaccine' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        $vaccine = Vaccine::create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);

        foreach ($data['doses'] ?? [] as $index => $dose) {
            $vaccine->doses()->create([
                'dose_number' => $dose['dose_number'] ?? $index + 1,
                'age_in_months' => $dose['age_in_months'],
                'description' => $dose['description'] ?? null,
            ]);
        }

        return redirect()->route('vaccines.index')
            ->with('success', 'تم إضافة التطعيم بنجاح.');
    }

    public function edit(Vaccine $vaccine): Response
    {
        $vaccine->load('doses');

        return Inertia::render('Vaccines/Form', [
            'vaccine' => [
                'id' => $vaccine->id,
                'name' => $vaccine->name,
                'description' => $vaccine->description,
                'is_active' => $vaccine->is_active,
                'doses' => $vaccine->doses->map(fn ($dose) => [
                    'id' => $dose->id,
                    'dose_number' => $dose->dose_number,
                    'age_in_months' => $dose->age_in_months,
                    'description' => $dose->description,
                ]),
            ],
        ]);
    }

    public function update(Request $request, Vaccine $vaccine): RedirectResponse
    {
        $data = $this->validated($request);

        $vaccine->update([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);

        $keptIds = collect($data['doses'] ?? [])->pluck('id')->filter()->all();
        $vaccine->doses()->whereNotIn('id', $keptIds)->delete();

        foreach ($data['doses'] ?? [] as $index => $dose) {
            $attributes = [
                'dose_number' => $dose['dose_number'] ?? $index + 1,
                'age_in_months' => $dose['age_in_months'],
                'description' => $dose['description'] ?? null,
            ];

            if (! empty($dose['id'])) {
                $vaccine->doses()->whereKey($dose['id'])->update($attributes);
            } else {
                $vaccine->doses()->create($attributes);
            }
        }

        return redirect()->route('vaccines.index')
            ->with('success', 'تم تحديث التطعيم بنجاح.');
    }

    public function destroy(Vaccine $vaccine): RedirectResponse
    {
        $vaccine->delete();

        return redirect()->route('vaccines.index')
            ->with('success', 'تم حذف التطعيم.');
    }

    /**
     * @return array<string, mixed>
     */
    protected function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['boolean'],
            'doses' => ['array'],
            'doses.*.id' => ['nullable', 'integer', 'exists:vaccine_doses,id'],
            'doses.*.dose_number' => ['nullable', 'integer', 'min:1'],
            'doses.*.age_in_months' => ['required', 'integer', 'min:0', 'max:240'],
            'doses.*.description' => ['nullable', 'string', 'max:255'],
        ], [], [
            'name' => 'اسم التطعيم',
            'description' => 'الوصف',
            'doses.*.age_in_months' => 'العمر المستهدف',
        ]);
    }
}
