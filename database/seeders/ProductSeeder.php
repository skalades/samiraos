<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductPrice;
use App\Enums\PriceTier;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Seed produk-produk Sami Raos.
     */
    public function run(): void
    {
        $products = [
            [
                'name' => 'Baso Geprek Instan',
                'slug' => 'baso-geprek-instan',
                'sku' => 'SR-BGI-001',
                'description' => 'Baso geprek instan khas Sami Raos, instant moodbooster dengan cita rasa pedas nendang.',
                'unit' => 'pcs',
                'weight_grams' => 150,
                'prices' => [
                    PriceTier::Pusat->value => 8500,
                    PriceTier::Distributor->value => 10000,
                    PriceTier::Agen->value => 12000,
                ],
            ],
            [
                'name' => 'Baso Aci Original',
                'slug' => 'baso-aci-original',
                'sku' => 'SR-BAO-002',
                'description' => 'Baso aci dengan kuah gurih pedas, dilengkapi kerupuk dan cuko spesial.',
                'unit' => 'pcs',
                'weight_grams' => 180,
                'prices' => [
                    PriceTier::Pusat->value => 9000,
                    PriceTier::Distributor->value => 10500,
                    PriceTier::Agen->value => 12500,
                ],
            ],
            [
                'name' => 'Bakso Tulang Rangu',
                'slug' => 'bakso-tulang-rangu',
                'sku' => 'SR-BTR-003',
                'description' => 'Bakso tulang rangu premium dengan kuah kaldu sapi asli.',
                'unit' => 'pcs',
                'weight_grams' => 200,
                'prices' => [
                    PriceTier::Pusat->value => 12000,
                    PriceTier::Distributor->value => 14000,
                    PriceTier::Agen->value => 16500,
                ],
            ],
            [
                'name' => 'Seblak Original',
                'slug' => 'seblak-original',
                'sku' => 'SR-SBO-004',
                'description' => 'Seblak basah instan rasa original pedas, cocok untuk pecinta kuliner pedas.',
                'unit' => 'pcs',
                'weight_grams' => 160,
                'prices' => [
                    PriceTier::Pusat->value => 8000,
                    PriceTier::Distributor->value => 9500,
                    PriceTier::Agen->value => 11500,
                ],
            ],
            [
                'name' => 'Seblak Kering Pedas',
                'slug' => 'seblak-kering-pedas',
                'sku' => 'SR-SKP-005',
                'description' => 'Seblak kering level pedas extra, snack favorit anak muda.',
                'unit' => 'pcs',
                'weight_grams' => 120,
                'prices' => [
                    PriceTier::Pusat->value => 7500,
                    PriceTier::Distributor->value => 9000,
                    PriceTier::Agen->value => 11000,
                ],
            ],
            [
                'name' => 'Baso Aci Level Pedas',
                'slug' => 'baso-aci-level-pedas',
                'sku' => 'SR-BAP-006',
                'description' => 'Baso aci varian level pedas extra untuk penggemar cita rasa menantang.',
                'unit' => 'pcs',
                'weight_grams' => 180,
                'prices' => [
                    PriceTier::Pusat->value => 9500,
                    PriceTier::Distributor->value => 11000,
                    PriceTier::Agen->value => 13000,
                ],
            ],
        ];

        foreach ($products as $productData) {
            $prices = $productData['prices'];
            unset($productData['prices']);

            $product = Product::create($productData);

            foreach ($prices as $tier => $price) {
                ProductPrice::create([
                    'product_id' => $product->id,
                    'tier' => $tier,
                    'price' => $price,
                    'min_qty' => 1,
                ]);
            }
        }
    }
}
