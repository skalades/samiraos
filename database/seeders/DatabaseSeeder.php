<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     * Urutan penting: Territory → Product → User (yang membuat bindings & inventory).
     */
    public function run(): void
    {
        $this->call([
            TerritorySeeder::class,
            ProductSeeder::class,
            UserSeeder::class,
        ]);
    }
}
