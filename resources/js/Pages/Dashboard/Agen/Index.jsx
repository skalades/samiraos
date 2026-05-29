import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Package, 
    AlertTriangle, 
    ShoppingBag, 
    Phone, 
    MapPin, 
    Bell, 
    Plus, 
    Minus,
    CheckCircle,
    Calendar,
    Activity,
    User
} from 'lucide-react';

export default function AgenDashboard({ 
    territory, 
    parentDistributor, 
    inventories, 
    lowStockProducts, 
    myOrders, 
    announcements, 
    availableProducts 
}) {
    // PO Form
    const { data, setData, post, processing, reset } = useForm({
        items: [], // { product_id, qty }
        payment_type: 'cash',
        notes: ''
    });

    const [quantities, setQuantities] = useState({}); // { product_id: qty }

    const formatIDR = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const handleQtyChange = (productId, newQty, maxAvailable) => {
        const qty = Math.max(0, Math.min(newQty, maxAvailable));
        setQuantities(prev => ({
            ...prev,
            [productId]: qty
        }));

        // Sync with useForm items
        const updatedItems = { ...quantities, [productId]: qty };
        const formItems = Object.entries(updatedItems)
            .filter(([_, q]) => q > 0)
            .map(([pid, q]) => ({
                product_id: parseInt(pid),
                qty: q
            }));
        setData('items', formItems);
    };

    const handleConfirmDelivery = (orderId) => {
        if (confirm('Apakah Anda yakin sudah menerima barang pesanan ini? Stok Anda akan bertambah secara otomatis.')) {
            post(route('orders.deliver', orderId));
        }
    };

    const submitPO = (e) => {
        e.preventDefault();
        if (data.items.length === 0) {
            alert('Silakan pilih minimal 1 item dengan kuantitas lebih dari 0.');
            return;
        }

        post(route('orders.store'), {
            onSuccess: () => {
                reset();
                setQuantities({});
                alert('Purchase Order berhasil dikirim ke Distributor Induk Anda!');
            }
        });
    };

    const calculatePOTotal = () => {
        return data.items.reduce((total, item) => {
            const product = availableProducts.find(p => p.product.id === item.product_id);
            return total + (product ? product.price * item.qty : 0);
        }, 0);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                            Dashboard Agen Resmi
                        </h2>
                        <p className="text-sm text-slate-500">
                            Wilayah {territory?.name || 'Kemitraan Anda'} — Selamat datang kembali di Sami Raos DMS.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Agen Dashboard" />

            <div className="py-8 bg-slate-50 min-h-[calc(100vh-6.5rem)]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">

                    {/* BLINKING YELLOW BANNER FOR LOW STOCK (AS PER PRD) */}
                    {lowStockProducts.length > 0 && (
                        <div className="bg-amber-100 border border-amber-300 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500 rounded-full text-white">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-amber-900 font-extrabold text-sm uppercase tracking-wide">Peringatan: Stok Toko Retail Menipis!</h3>
                                    <p className="text-amber-800 text-xs font-semibold">Terdapat {lowStockProducts.length} produk di ambang batas. Segera restock ke Distributor sebelum menolak pesanan konsumen akhir.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow transition-colors shrink-0"
                            >
                                Re-Stock Sekarang
                            </button>
                        </div>
                    )}

                    {/* TOP SUMMARY ROW: DISTRIBUTOR INFO & INVENTORY */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* 1. Parent Distributor Info */}
                        <div className="glass-card rounded-3xl p-6 lg:col-span-2 space-y-4">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Distributor Penanggung Jawab</h3>
                            {parentDistributor ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-slate-800 font-bold">
                                            <User className="w-5 h-5 text-indigo-500" />
                                            {parentDistributor.name}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                            <Phone className="w-4 h-4 text-slate-400" />
                                            {parentDistributor.phone}
                                        </div>
                                        <div className="flex items-start gap-2 text-xs text-slate-600">
                                            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                            {parentDistributor.address}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-start md:justify-end">
                                        <a 
                                            href={`https://wa.me/${parentDistributor.phone.replace(/[^0-9]/g, '')}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                                        >
                                            Hubungi Distributor (WhatsApp)
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-xs text-slate-500 bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                                    Anda belum terikat ke Distributor resmi mana pun. Hubungi admin pusat.
                                </div>
                            )}
                        </div>

                        {/* 2. Ringkasan Inventori Siap Jual */}
                        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-3">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Inventori Siap Jual</h3>
                                    <Package className="w-5 h-5 text-indigo-500" />
                                </div>
                                <div className="space-y-3 max-h-[150px] overflow-y-auto pr-2">
                                    {inventories.length > 0 ? (
                                        inventories.map((inv) => (
                                            <div key={inv.id} className="flex justify-between items-center text-xs">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-700">{inv.product.name}</span>
                                                    {inv.is_low_stock && (
                                                        <span className="text-[10px] text-rose-500 font-bold">Stok kritis!</span>
                                                    )}
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-lg font-extrabold ${inv.is_low_stock ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-slate-100 text-slate-800'}`}>
                                                    {inv.qty.toLocaleString('id-ID')} pcs
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-6 text-slate-400 text-xs">Anda belum memiliki stok produk apapun.</div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 border-t border-slate-100 pt-4 text-[10px] text-slate-400 flex justify-between">
                                <span>Total Item: {inventories.length} jenis</span>
                                <span className="font-semibold text-indigo-600 cursor-pointer hover:underline" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
                                    Restock ke Pusat →
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* MID ROW: PLACE ORDER PO SECTION */}
                    {parentDistributor && (
                        <div className="glass-card rounded-3xl p-6 space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5 text-indigo-500" />
                                    Buat Purchase Order Baru ke Distributor Induk
                                </h3>
                                <p className="text-xs text-slate-500">Pilih produk dan tentukan kuantitas PO Anda. Harga grosir otomatis diterapkan.</p>
                            </div>

                            <form onSubmit={submitPO} className="space-y-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b text-slate-400 font-bold">
                                                <th className="py-2.5">Produk</th>
                                                <th className="py-2.5">Stok Distributor</th>
                                                <th className="py-2.5 text-right">Harga Agen (per pcs)</th>
                                                <th className="py-2.5 text-center">Jumlah Pesanan</th>
                                                <th className="py-2.5 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y text-slate-700">
                                            {availableProducts.length > 0 ? (
                                                availableProducts.map((p) => {
                                                    const currentQty = quantities[p.product.id] || 0;
                                                    const subtotal = p.price * currentQty;

                                                    return (
                                                        <tr key={p.product.id} className="hover:bg-slate-50/30">
                                                            <td className="py-3 flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 overflow-hidden">
                                                                    {p.product.image ? (
                                                                        <img src={`/storage/${p.product.image}`} alt={p.product.name} className="object-cover w-full h-full" />
                                                                    ) : (
                                                                        p.product.name.charAt(0)
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <span className="font-semibold text-slate-800">{p.product.name}</span>
                                                                    <span className="block text-[10px] text-slate-400">SKU: {p.product.sku}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-3">
                                                                <span className={`px-2 py-0.5 rounded font-bold ${p.available_qty > 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                                                    {p.available_qty.toLocaleString('id-ID')} pcs ready
                                                                </span>
                                                            </td>
                                                            <td className="py-3 text-right font-semibold text-slate-800">
                                                                {formatIDR(p.price)}
                                                            </td>
                                                            <td className="py-3">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleQtyChange(p.product.id, currentQty - 10, p.available_qty)}
                                                                        className="p-1 hover:bg-slate-100 rounded text-slate-500 border border-slate-200"
                                                                    >
                                                                        <Minus className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <input
                                                                        type="number"
                                                                        className="w-16 text-center text-xs border-slate-200 rounded-lg p-1.5 focus:ring-indigo-500 focus:border-indigo-500"
                                                                        value={currentQty}
                                                                        onChange={(e) => handleQtyChange(p.product.id, parseInt(e.target.value) || 0, p.available_qty)}
                                                                        min="0"
                                                                        max={p.available_qty}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleQtyChange(p.product.id, currentQty + 10, p.available_qty)}
                                                                        className="p-1 hover:bg-slate-100 rounded text-slate-500 border border-slate-200"
                                                                    >
                                                                        <Plus className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 text-right font-extrabold text-slate-800">
                                                                {formatIDR(subtotal)}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-12 text-slate-400">Tidak ada produk tersedia di gudang induk saat ini.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {data.items.length > 0 && (
                                    <div className="border-t pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                        <div className="space-y-1">
                                            <div className="text-xs text-slate-500">Estimasi Total Transaksi (Cash)</div>
                                            <div className="text-2xl font-extrabold text-indigo-700">{formatIDR(calculatePOTotal())}</div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="text"
                                                className="text-xs rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 p-2.5 min-w-[200px]"
                                                placeholder="Catatan tambahan PO (Opsional)"
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                            />
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition-all duration-150 disabled:opacity-50"
                                            >
                                                {processing ? 'Mengirim PO...' : 'Kirim PO Sekarang'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    )}

                    {/* BOTTOM ROW: PO HISTORY & ANNOUNCEMENTS */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* PO History Table */}
                        <div className="lg:col-span-2 glass-card rounded-3xl p-6 space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 border-b pb-3">Riwayat PO Saya</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b text-slate-400 font-bold">
                                            <th className="py-2.5">No. PO</th>
                                            <th className="py-2.5">Tanggal</th>
                                            <th className="py-2.5">Total PO</th>
                                            <th className="py-2.5">Status</th>
                                            <th className="py-2.5 text-center">Aksi Konfirmasi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y text-slate-700">
                                        {myOrders.length > 0 ? (
                                            myOrders.map((order) => (
                                                <tr key={order.id} className="hover:bg-slate-50/20">
                                                    <td className="py-3 font-bold text-slate-800">{order.order_number}</td>
                                                    <td className="py-3 text-slate-400">
                                                        {new Date(order.created_at).toLocaleDateString('id-ID')}
                                                    </td>
                                                    <td className="py-3 font-extrabold text-slate-800">
                                                        {formatIDR(order.total)}
                                                    </td>
                                                    <td className="py-3">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase
                                                            ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 
                                                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800 animate-pulse' : 
                                                              order.status === 'approved' || order.status === 'processing' ? 'bg-indigo-100 text-indigo-800' : 
                                                              order.status === 'rejected' || order.status === 'cancelled' ? 'bg-rose-100 text-rose-800' : 
                                                              'bg-slate-100 text-slate-800'}`}
                                                        >
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-center">
                                                        {order.status === 'shipped' ? (
                                                            <button
                                                                onClick={() => handleConfirmDelivery(order.id)}
                                                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-sm transition-colors flex items-center gap-1 mx-auto"
                                                            >
                                                                <CheckCircle className="w-3 h-3" />
                                                                Konfirmasi Diterima
                                                            </button>
                                                        ) : (
                                                            <span className="text-[10px] text-slate-400">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-12 text-slate-400">Belum ada riwayat PO dibuat.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Announcements Feed for Agents */}
                        <div className="glass-card rounded-3xl p-6 space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 border-b pb-3 flex items-center gap-2">
                                <Bell className="w-5 h-5 text-indigo-500" />
                                Pengumuman & Feed
                            </h3>

                            <div className="space-y-4 overflow-y-auto max-h-[300px] pr-1">
                                {announcements.length > 0 ? (
                                    announcements.map((ann) => (
                                        <div key={ann.id} className="border-b last:border-0 pb-3 last:pb-0 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                                                    ${ann.type === 'urgent' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'}`}
                                                >
                                                    {ann.type}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {new Date(ann.published_at || ann.created_at).toLocaleDateString('id-ID')}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-slate-800 text-sm leading-snug">{ann.title}</h4>
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{ann.body}</p>

                                            {ann.attachment && ann.attachment.match(/\.(jpeg|jpg|gif|png)$/i) && (
                                                <div className="mt-2">
                                                    <img 
                                                        src={`/storage/${ann.attachment}`} 
                                                        alt="Lampiran" 
                                                        className="w-full h-auto max-h-32 object-cover rounded-xl border border-slate-200/50 shadow-sm"
                                                    />
                                                </div>
                                            )}
                                            {ann.attachment && ann.attachment.match(/\.pdf$/i) && (
                                                <div className="mt-2">
                                                    <a href={`/storage/${ann.attachment}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-indigo-600 hover:bg-slate-50 transition-colors shadow-sm">
                                                        📄 Lihat PDF
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-slate-400 text-xs">Belum ada pengumuman terbit.</div>
                                )}
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
