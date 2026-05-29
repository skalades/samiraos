<?php

namespace App\Enums;

/**
 * Enum untuk jenis pesanan berdasarkan arah distribusi.
 *
 * Menentukan alur pemesanan antara level jaringan distribusi:
 * - Distributor memesan ke Pusat
 * - Agen memesan ke Distributor
 */
enum OrderType: string
{
    /** Pesanan dari Distributor ke Pusat (gudang utama) */
    case DistributorToPusat = 'distributor_to_pusat';

    /** Pesanan dari Agen ke Distributor */
    case AgenToDistributor = 'agen_to_distributor';

    /**
     * Mendapatkan label tampilan yang ramah pengguna.
     */
    public function label(): string
    {
        return match ($this) {
            self::DistributorToPusat => 'Distributor → Pusat',
            self::AgenToDistributor => 'Agen → Distributor',
        };
    }
}
