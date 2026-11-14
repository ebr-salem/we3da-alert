<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\VaccinationService;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@we7da.test'],
            [
                'name' => 'مدير الوحدة الصحية',
                'phone' => '01000000000',
                'role' => 'admin',
                'password' => 'password',
            ],
        );

        User::updateOrCreate(
            ['email' => 'staff@we7da.test'],
            [
                'name' => 'موظف الوحدة',
                'phone' => '01100000000',
                'role' => 'staff',
                'password' => 'password',
            ],
        );

        $this->call(VaccinationScheduleSeeder::class);
        $this->call(ChildSeeder::class);

        app(VaccinationService::class)->syncAll();
    }
}
