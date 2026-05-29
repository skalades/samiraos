<?php

namespace App\Enums;

/**
 * Enum untuk jenis stock opname/penyesuaian stok.
 *
 * Digunakan saat melakukan penghitungan fisik atau
 * penyesuaian stok karena berbagai alasan.
 */
enum StockOpnameType: string
{
    /** Stock opname rutin - penghitungan fisik berkala */
    case Opname = 'opname';

    /** Penolakan/retur produk yang rusak atau expired */
    case Reject = 'reject';

    /** Penyesuaian stok manual oleh admin */
    case Adjustment = 'adjustment';

    /**
     * Mendapatkan label tampilan yang ramah pengguna.
     */
    public function label(): string
    {
        return match ($this) {
            self::Opname => 'Stock Opname',
            self::Reject => 'Reject / Retur',
            self::Adjustment => 'Penyesuaian',
        };
    }

    /**
     * Mendapatkan warna badge untuk tampilan UI.
     */
    public function color(): string
    {
        return match ($this) {
            self::Opname => 'blue',
            self::Reject => 'red',
            self::Adjustment => 'yellow',
        };
    }
}
