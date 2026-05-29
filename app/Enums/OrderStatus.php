<?php

namespace App\Enums;

/**
 * Enum untuk status pesanan (Purchase Order) dalam alur distribusi.
 *
 * Alur normal: Pending → Approved → Processing → Shipped → Delivered
 * Pesanan dapat ditolak (Rejected) atau dibatalkan (Cancelled) kapan saja.
 */
enum OrderStatus: string
{
    /** Menunggu persetujuan dari penjual */
    case Pending = 'pending';

    /** Disetujui oleh penjual, siap diproses */
    case Approved = 'approved';

    /** Ditolak oleh penjual */
    case Rejected = 'rejected';

    /** Sedang diproses/dikemas */
    case Processing = 'processing';

    /** Sudah dikirim ke pembeli */
    case Shipped = 'shipped';

    /** Diterima oleh pembeli */
    case Delivered = 'delivered';

    /** Dibatalkan */
    case Cancelled = 'cancelled';

    /**
     * Mendapatkan label tampilan yang ramah pengguna.
     */
    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Menunggu Persetujuan',
            self::Approved => 'Disetujui',
            self::Rejected => 'Ditolak',
            self::Processing => 'Diproses',
            self::Shipped => 'Dikirim',
            self::Delivered => 'Diterima',
            self::Cancelled => 'Dibatalkan',
        };
    }

    /**
     * Mendapatkan warna badge untuk tampilan UI.
     */
    public function color(): string
    {
        return match ($this) {
            self::Pending => 'yellow',
            self::Approved => 'blue',
            self::Rejected => 'red',
            self::Processing => 'indigo',
            self::Shipped => 'purple',
            self::Delivered => 'green',
            self::Cancelled => 'gray',
        };
    }

    /**
     * Cek apakah status ini merupakan status terminal (final).
     */
    public function isFinal(): bool
    {
        return in_array($this, [self::Delivered, self::Rejected, self::Cancelled]);
    }
}
