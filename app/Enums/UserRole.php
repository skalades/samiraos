<?php

namespace App\Enums;

/**
 * Enum untuk role pengguna dalam sistem DMS Sami Raos.
 *
 * Role menentukan hak akses dan tampilan dashboard yang berbeda
 * untuk setiap jenis pengguna dalam jaringan distribusi.
 */
enum UserRole: string
{
    /** Super Admin - Pengelola pusat dengan akses penuh ke seluruh sistem */
    case SuperAdmin = 'super_admin';

    /** Distributor - Mitra distribusi yang mengelola wilayah tertentu */
    case Distributor = 'distributor';

    /** Agen - Penjual akhir yang terikat pada distributor tertentu */
    case Agen = 'agen';

    /**
     * Mendapatkan label tampilan yang ramah pengguna.
     */
    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super Admin',
            self::Distributor => 'Distributor',
            self::Agen => 'Agen',
        };
    }

    /**
     * Mendapatkan warna badge untuk tampilan UI.
     */
    public function color(): string
    {
        return match ($this) {
            self::SuperAdmin => 'red',
            self::Distributor => 'blue',
            self::Agen => 'green',
        };
    }
}
