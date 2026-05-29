<?php

namespace App\Enums;

/**
 * Enum untuk target audiens pengumuman.
 *
 * Menentukan siapa saja yang akan menerima pengumuman:
 * bisa semua pengguna, hanya distributor, atau hanya agen.
 */
enum TargetRole: string
{
    /** Semua pengguna (distributor dan agen) */
    case All = 'all';

    /** Hanya distributor */
    case Distributor = 'distributor';

    /** Hanya agen */
    case Agen = 'agen';

    /**
     * Mendapatkan label tampilan yang ramah pengguna.
     */
    public function label(): string
    {
        return match ($this) {
            self::All => 'Semua',
            self::Distributor => 'Distributor',
            self::Agen => 'Agen',
        };
    }
}
