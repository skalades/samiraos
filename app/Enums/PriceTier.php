<?php

namespace App\Enums;

/**
 * Enum untuk tier harga produk berdasarkan level distribusi.
 *
 * Setiap produk memiliki harga berbeda di setiap level:
 * - Pusat: Harga dasar dari pabrik/produsen
 * - Distributor: Harga beli distributor dari pusat
 * - Agen: Harga beli agen dari distributor
 */
enum PriceTier: string
{
    /** Harga level pusat (HPP / harga dasar) */
    case Pusat = 'pusat';

    /** Harga level distributor */
    case Distributor = 'distributor';

    /** Harga level agen */
    case Agen = 'agen';

    /**
     * Mendapatkan label tampilan yang ramah pengguna.
     */
    public function label(): string
    {
        return match ($this) {
            self::Pusat => 'Harga Pusat',
            self::Distributor => 'Harga Distributor',
            self::Agen => 'Harga Agen',
        };
    }
}
