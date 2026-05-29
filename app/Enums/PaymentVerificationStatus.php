<?php

namespace App\Enums;

/**
 * Enum untuk status verifikasi pembayaran piutang.
 *
 * Setiap pembayaran piutang memerlukan dual-verification:
 * distributor mengunggah bukti → pusat memverifikasi.
 */
enum PaymentVerificationStatus: string
{
    /** Menunggu verifikasi dari admin pusat */
    case PendingVerification = 'pending_verification';

    /** Pembayaran disetujui dan diverifikasi */
    case Approved = 'approved';

    /** Pembayaran ditolak (bukti tidak valid, dll.) */
    case Rejected = 'rejected';

    /**
     * Mendapatkan label tampilan yang ramah pengguna.
     */
    public function label(): string
    {
        return match ($this) {
            self::PendingVerification => 'Menunggu Verifikasi',
            self::Approved => 'Disetujui',
            self::Rejected => 'Ditolak',
        };
    }

    /**
     * Mendapatkan warna badge untuk tampilan UI.
     */
    public function color(): string
    {
        return match ($this) {
            self::PendingVerification => 'yellow',
            self::Approved => 'green',
            self::Rejected => 'red',
        };
    }
}
