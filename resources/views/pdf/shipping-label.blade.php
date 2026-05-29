<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Label Pengiriman - {{ $order->order_number }}</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 11px;
            color: #334155;
            margin: 0;
            padding: 10px;
        }
        .header {
            border-bottom: 2px double #cbd5e1;
            padding-bottom: 8px;
            margin-bottom: 12px;
            text-align: center;
        }
        .title {
            font-size: 16px;
            font-weight: bold;
            color: #1e293b;
            margin: 0;
            text-transform: uppercase;
        }
        .subtitle {
            font-size: 10px;
            color: #64748b;
            margin: 2px 0 0 0;
        }
        .address-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .address-col {
            width: 50%;
            vertical-align: top;
            padding: 8px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            background-color: #f8fafc;
        }
        .address-title {
            font-weight: bold;
            font-size: 10px;
            color: #475569;
            text-transform: uppercase;
            margin-bottom: 4px;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 2px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .items-table th {
            background-color: #f1f5f9;
            font-weight: bold;
            text-align: left;
            padding: 6px;
            border: 1px solid #cbd5e1;
            font-size: 10px;
            color: #334155;
        }
        .items-table td {
            padding: 6px;
            border: 1px solid #cbd5e1;
        }
        .footer {
            margin-top: 25px;
            text-align: center;
            font-size: 8px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2 class="title">Sami Raos DMS</h2>
        <p class="subtitle">LABEL PENGIRIMAN RESMI &bull; PO: {{ $order->order_number }}</p>
    </div>

    <table class="address-table">
        <tr>
            <td class="address-col" style="padding-right: 15px;">
                <div class="address-title">Pengirim (Seller):</div>
                <strong>{{ $order->seller ? $order->seller->name : 'Gudang Pusat Sami Raos' }}</strong><br>
                Telp: {{ $order->seller ? $order->seller->phone : '081234567890' }}<br>
                Alamat: {{ $order->seller ? $order->seller->address : 'Gudang Pusat, Garut, Jawa Barat' }}
            </td>
            <td class="address-col">
                <div class="address-title">Penerima (Buyer):</div>
                <strong>{{ $order->buyer->name }}</strong><br>
                Telp: {{ $order->buyer->phone }}<br>
                Alamat: {{ $order->buyer->address }}
            </td>
        </tr>
    </table>

    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 10%;">No</th>
                <th style="width: 45%;">Nama Produk</th>
                <th style="width: 25%;">SKU</th>
                <th style="width: 20%; text-align: center;">Jumlah (Qty)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $index => $item)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td><strong>{{ $item->product->name }}</strong></td>
                    <td>{{ $item->product->sku }}</td>
                    <td style="text-align: center; font-weight: bold;">{{ $item->qty }} {{ $item->product->unit }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Dicetak otomatis oleh Sistem Manajemen Distribusi Sami Raos (DMS) pada {{ now()->timezone('Asia/Jakarta')->format('d-m-Y H:i:s') }} WIB
    </div>
</body>
</html>
