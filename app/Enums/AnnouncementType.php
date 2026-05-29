<?php

namespace App\Enums;

/**
 * Enum untuk jenis pengumuman yang dikirimkan ke jaringan distribusi.
 *
 * Tipe pengumuman menentukan tampilan visual dan prioritas notifikasi.
 */
enum AnnouncementType: string
{
    /** Informasi umum */
    case Info = 'info';

    /** Peringatan penting */
    case Warning = 'warning';

    /** Promosi produk atau program */
    case Promo = 'promo';

    /** Pengumuman mendesak yang harus segera diperhatikan */
    case Urgent = 'urgent';

    /**
     * Mendapatkan label tampilan yang ramah pengguna.
     */
    public function label(): string
    {
        return match ($this) {
            self::Info => 'Informasi',
            self::Warning => 'Peringatan',
            self::Promo => 'Promosi',
            self::Urgent => 'Mendesak',
        };
    }

    /**
     * Mendapatkan warna badge untuk tampilan UI.
     */
    public function color(): string
    {
        return match ($this) {
            self::Info => 'blue',
            self::Warning => 'yellow',
            self::Promo => 'green',
            self::Urgent => 'red',
        };
    }

    /**
     * Mendapatkan ikon untuk tampilan UI.
     */
    public function icon(): string
    {
        return match ($this) {
            self::Info => 'info-circle',
            self::Warning => 'exclamation-triangle',
            self::Promo => 'tag',
            self::Urgent => 'exclamation-circle',
        };
    }
}
