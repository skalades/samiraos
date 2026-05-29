<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use App\Models\Territory;
use App\Models\NetworkBinding;
use App\Models\Product;
use App\Models\Inventory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed pengguna: Super Admin, sample Distributor & Agen.
     */
    public function run(): void
    {
        // 1. Super Admin (Gudang Pusat)
        $admin = User::create([
            'name' => 'Admin Pusat Sami Raos',
            'email' => 'admin@samiraos.id',
            'password' => Hash::make('password'),
            'role' => UserRole::SuperAdmin,
            'phone' => '081234567890',
            'address' => 'Gudang Pusat Sami Raos, Garut, Jawa Barat',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // 2. Buat Distributor untuk setiap territory
        $territories = Territory::all();
        $products = Product::all();

        foreach ($territories as $index => $territory) {
            $distributor = User::create([
                'name' => 'Distributor ' . $territory->name,
                'email' => 'distributor.' . $territory->slug . '@samiraos.id',
                'password' => Hash::make('password'),
                'role' => UserRole::Distributor,
                'phone' => '08' . str_pad($index + 1, 10, '0', STR_PAD_LEFT),
                'address' => 'Gudang Regional ' . $territory->name,
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            // Bind distributor ke territory
            NetworkBinding::create([
                'user_id' => $distributor->id,
                'role' => 'distributor',
                'territory_id' => $territory->id,
                'parent_id' => null,
                'credit_limit' => 50000000, // Rp 50 juta default
                'credit_used' => 0,
            ]);

            // Beri stok awal ke distributor
            foreach ($products as $product) {
                Inventory::create([
                    'user_id' => $distributor->id,
                    'product_id' => $product->id,
                    'qty' => rand(500, 2000),
                    'low_stock_threshold' => 200,
                ]);
            }

            // 3. Buat 5 Agen per distributor (total ~85 agen sample)
            for ($i = 1; $i <= 5; $i++) {
                $agen = User::create([
                    'name' => 'Agen ' . $territory->name . ' ' . $i,
                    'email' => 'agen' . $i . '.' . $territory->slug . '@samiraos.id',
                    'password' => Hash::make('password'),
                    'role' => UserRole::Agen,
                    'phone' => '089' . str_pad(($index * 5) + $i, 9, '0', STR_PAD_LEFT),
                    'address' => 'Toko Agen ' . $i . ', ' . $territory->name,
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]);

                // Bind agen ke territory dan parent distributor
                NetworkBinding::create([
                    'user_id' => $agen->id,
                    'role' => 'agen',
                    'territory_id' => $territory->id,
                    'parent_id' => $distributor->id,
                    'credit_limit' => 0,
                    'credit_used' => 0,
                ]);

                // Beri stok awal ke agen
                foreach ($products as $product) {
                    Inventory::create([
                        'user_id' => $agen->id,
                        'product_id' => $product->id,
                        'qty' => rand(50, 300),
                        'low_stock_threshold' => 50,
                    ]);
                }
            }
        }

        // Beri stok gudang pusat (admin)
        foreach ($products as $product) {
            Inventory::create([
                'user_id' => $admin->id,
                'product_id' => $product->id,
                'qty' => rand(10000, 50000),
                'low_stock_threshold' => 1000,
            ]);
        }
    }
}
