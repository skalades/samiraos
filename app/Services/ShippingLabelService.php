<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Database\Eloquent\Collection;
use Barryvdh\DomPDF\Facade\Pdf;

class ShippingLabelService
{
    /**
     * Generate shipping label PDF untuk satu order.
     *
     * Label berisi:
     * - Nomor order
     * - Info pengirim (seller)
     * - Info penerima (buyer) + alamat
     * - Daftar item + qty
     * - Tanggal pengiriman
     *
     * @param  Order $order
     * @return string Path ke file PDF yang di-generate (public storage url path)
     */
    public function generateLabel(Order $order): string
    {
        $order->load(['buyer', 'seller', 'items.product']);

        $filename = "shipping-label-{$order->order_number}.pdf";
        $directory = storage_path("app/public/shipping-labels");
        
        if (!file_exists($directory)) {
            mkdir($directory, 0755, true);
        }
        
        $path = "{$directory}/{$filename}";

        $pdf = Pdf::loadView('pdf.shipping-label', [
            'order' => $order,
        ]);
        $pdf->save($path);

        return "storage/shipping-labels/{$filename}";
    }

    /**
     * Generate shipping labels PDF untuk multiple orders (bulk).
     * Semua label digabung dalam satu file PDF.
     *
     * @param  Collection<int, Order> $orders
     * @return string Path ke file PDF yang di-generate (public storage url path)
     */
    public function generateBulkLabels(Collection $orders): string
    {
        $orders->load(['buyer', 'seller', 'items.product']);

        $timestamp = now()->format('Ymd-His');
        $filename = "shipping-labels-bulk-{$timestamp}.pdf";
        $directory = storage_path("app/public/shipping-labels");
        
        if (!file_exists($directory)) {
            mkdir($directory, 0755, true);
        }
        
        $path = "{$directory}/{$filename}";

        $pdf = Pdf::loadView('pdf.shipping-labels-bulk', [
            'orders' => $orders,
        ]);
        $pdf->save($path);

        return "storage/shipping-labels/{$filename}";
    }
}
