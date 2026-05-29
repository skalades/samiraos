<?php

namespace App\Enums;

/**
 * Enum untuk jenis pembayaran pesanan.
 *
 * - Cash: Pembayaran langsung saat pemesanan
 * - Tempo: Pembayaran ditunda (kredit) dengan batas waktu tertentu
 */
enum PaymentType: string
{
    /** Pembayaran tunai/langsung */
    case Cash = 'cash';

    /** Pembayaran tempo/kredit dengan jatuh tempo */
    case Tempo = 'tempo';

    /**
     * Mendapatkan label tampilan yang ramah pengguna.
     */
    public function label(): string
    {
        return match ($this) {
            self::Cash => 'Tunai',
            self::Tempo => 'Tempo (Kredit)',
        };
    }

    /**
     * Mendapatkan warna badge untuk tampilan UI.
     */
    public function color(): string
    {
        return match ($this) {
            self::Cash => 'green',
            self::Tempo => 'orange',
        };
    }
}
