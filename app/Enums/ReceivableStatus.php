<?php

namespace App\Enums;

/**
 * Enum untuk status piutang (receivable) pusat ke distributor.
 *
 * Piutang terjadi saat distributor melakukan pembelian dengan tipe tempo.
 * Status berubah seiring pembayaran dilakukan oleh distributor.
 */
enum ReceivableStatus: string
{
    /** Belum ada pembayaran sama sekali */
    case Unpaid = 'unpaid';

    /** Sudah ada pembayaran sebagian */
    case PartiallyPaid = 'partially_paid';

    /** Lunas - sudah dibayar penuh */
    case Paid = 'paid';

    /** Melewati jatuh tempo tanpa pelunasan */
    case Overdue = 'overdue';

    /**
     * Mendapatkan label tampilan yang ramah pengguna.
     */
    public function label(): string
    {
        return match ($this) {
            self::Unpaid => 'Belum Dibayar',
            self::PartiallyPaid => 'Dibayar Sebagian',
            self::Paid => 'Lunas',
            self::Overdue => 'Jatuh Tempo',
        };
    }

    /**
     * Mendapatkan warna badge untuk tampilan UI.
     */
    public function color(): string
    {
        return match ($this) {
            self::Unpaid => 'red',
            self::PartiallyPaid => 'yellow',
            self::Paid => 'green',
            self::Overdue => 'red',
        };
    }

    /**
     * Cek apakah piutang masih memerlukan pembayaran.
     */
    public function needsPayment(): bool
    {
        return in_array($this, [self::Unpaid, self::PartiallyPaid, self::Overdue]);
    }
}
