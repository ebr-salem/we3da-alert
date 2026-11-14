<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\ChildController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\VaccinationController;
use App\Http\Controllers\VaccineController;
use App\Http\Controllers\VaccineDoseController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard');

Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
});

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('children', ChildController::class);
    Route::get('children/{child}/vaccinations/sync', [ChildController::class, 'sync'])
        ->name('children.sync');

    Route::resource('vaccines', VaccineController::class)->except(['show']);
    Route::post('vaccines/{vaccine}/doses', [VaccineDoseController::class, 'store'])
        ->name('vaccines.doses.store');
    Route::put('doses/{dose}', [VaccineDoseController::class, 'update'])
        ->name('doses.update');
    Route::delete('doses/{dose}', [VaccineDoseController::class, 'destroy'])
        ->name('doses.destroy');

    Route::get('vaccinations', [VaccinationController::class, 'index'])->name('vaccinations.index');
    Route::post('vaccinations', [VaccinationController::class, 'store'])->name('vaccinations.store');
    Route::put('vaccinations/{vaccination}', [VaccinationController::class, 'update'])
        ->name('vaccinations.update');
    Route::delete('vaccinations/{vaccination}', [VaccinationController::class, 'destroy'])
        ->name('vaccinations.destroy');

    Route::get('notifications', [MessageController::class, 'index'])->name('notifications.index');
    Route::post('notifications/send', [MessageController::class, 'send'])->name('notifications.send');
    Route::post('notifications/send-all', [MessageController::class, 'sendAll'])->name('notifications.send-all');
    Route::get('messages', [MessageController::class, 'log'])->name('messages.index');
    Route::delete('messages/{message}', [MessageController::class, 'destroy'])->name('messages.destroy');
});
