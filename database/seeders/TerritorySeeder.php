<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use App\Models\Territory;
use App\Models\NetworkBinding;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TerritorySeeder extends Seeder
{
    /**
     * Seed 17 wilayah distributor Sami Raos.
     */
    public function run(): void
    {
        $territories = [
            ['name' => 'Garut', 'slug' => 'garut', 'latitude' => -7.2167, 'longitude' => 107.9083, 'max_stock_capacity' => 5000],
            ['name' => 'Tasikmalaya', 'slug' => 'tasikmalaya', 'latitude' => -7.3274, 'longitude' => 108.2207, 'max_stock_capacity' => 5000],
            ['name' => 'Bandung', 'slug' => 'bandung', 'latitude' => -6.9175, 'longitude' => 107.6191, 'max_stock_capacity' => 8000],
            ['name' => 'Sumedang', 'slug' => 'sumedang', 'latitude' => -6.8382, 'longitude' => 107.9192, 'max_stock_capacity' => 4000],
            ['name' => 'Cianjur', 'slug' => 'cianjur', 'latitude' => -6.8171, 'longitude' => 107.1428, 'max_stock_capacity' => 4000],
            ['name' => 'Sukabumi', 'slug' => 'sukabumi', 'latitude' => -6.9277, 'longitude' => 106.9300, 'max_stock_capacity' => 4500],
            ['name' => 'Bogor', 'slug' => 'bogor', 'latitude' => -6.5971, 'longitude' => 106.8060, 'max_stock_capacity' => 7000],
            ['name' => 'Cirebon', 'slug' => 'cirebon', 'latitude' => -6.7320, 'longitude' => 108.5523, 'max_stock_capacity' => 5000],
            ['name' => 'Kuningan', 'slug' => 'kuningan', 'latitude' => -6.9757, 'longitude' => 108.4850, 'max_stock_capacity' => 3500],
            ['name' => 'Majalengka', 'slug' => 'majalengka', 'latitude' => -6.8371, 'longitude' => 108.2274, 'max_stock_capacity' => 3500],
            ['name' => 'Subang', 'slug' => 'subang', 'latitude' => -6.5714, 'longitude' => 107.7530, 'max_stock_capacity' => 4000],
            ['name' => 'Karawang', 'slug' => 'karawang', 'latitude' => -6.3233, 'longitude' => 107.3376, 'max_stock_capacity' => 5500],
            ['name' => 'Bekasi', 'slug' => 'bekasi', 'latitude' => -6.2349, 'longitude' => 106.9896, 'max_stock_capacity' => 6500],
            ['name' => 'Depok', 'slug' => 'depok', 'latitude' => -6.4025, 'longitude' => 106.7942, 'max_stock_capacity' => 5000],
            ['name' => 'Tangerang', 'slug' => 'tangerang', 'latitude' => -6.1781, 'longitude' => 106.6319, 'max_stock_capacity' => 6000],
            ['name' => 'Jakarta', 'slug' => 'jakarta', 'latitude' => -6.2088, 'longitude' => 106.8456, 'max_stock_capacity' => 10000],
            ['name' => 'Semarang', 'slug' => 'semarang', 'latitude' => -6.9666, 'longitude' => 110.4196, 'max_stock_capacity' => 6000],
        ];

        foreach ($territories as $territory) {
            Territory::create($territory);
        }
    }
}
