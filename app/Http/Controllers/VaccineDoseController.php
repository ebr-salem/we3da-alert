<?php

namespace App\Http\Controllers;

use App\Models\Vaccine;
use App\Models\VaccineDose;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class VaccineDoseController extends Controller
{
    public function store(Request $request, Vaccine $vaccine): RedirectResponse
    {
        $data = $request->validate([
            'dose_number' => ['required', 'integer', 'min:1'],
            'age_in_months' => ['required', 'integer', 'min:0', 'max:240'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        $vaccine->doses()->create($data);

        return back()->with('success', 'تم إضافة الجرعة.');
    }

    public function update(Request $request, VaccineDose $dose): RedirectResponse
    {
        $data = $request->validate([
            'dose_number' => ['required', 'integer', 'min:1'],
            'age_in_months' => ['required', 'integer', 'min:0', 'max:240'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        $dose->update($data);

        return back()->with('success', 'تم تحديث الجرعة.');
    }

    public function destroy(VaccineDose $dose): RedirectResponse
    {
        $dose->delete();

        return back()->with('success', 'تم حذف الجرعة.');
    }
}
