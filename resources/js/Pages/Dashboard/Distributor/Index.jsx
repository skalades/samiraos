import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Package, 
    AlertTriangle, 
    CreditCard, 
    ShoppingBag, 
    FileText, 
    Bell, 
    Check, 
    X,
    Upload,
    Calendar,
    Activity,
    MapPin
} from 'lucide-react';

export default function DistributorDashboard({ 
    territory, 
    inventories, 
    lowStockProducts, 
    creditInfo, 
    pendingAgentOrders, 
    receivables, 
    recentLogs, 
    announcements 
}) {
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [rejectingOrder, setRejectingOrder] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // Payment Form
    const { data: payData, setData: setPayData, post: postPay, processing: payProcessing, reset: resetPay } = useForm({
        amount: '',
        bank_name: '',
        account_number: '',
        transfer_date: new Date().toISOString().split('T')[0],
        payment_proof: null
    });

    // Reject Form
    const { post: postReject, processing: rejectProcessing } = useForm({
        reason: ''
    });

    // Approve Form
    const { post: postApprove, processing: approveProcessing } = useForm();

    const formatIDR = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const handleOpenPaymentModal = (invoice) => {
        setSelectedInvoice(invoice);
        setPayData({
            amount: invoice.remaining_balance.toString(),
            bank_name: '',
            account_number: '',
            transfer_date: new Date().toISOString().split('T')[0],
            payment_proof: null
        });
    };

    const handleClosePaymentModal = () => {
        setSelectedInvoice(null);
        resetPay();
    };

    const submitPayment = (e) => {
        e.preventDefault();
        postPay(route('receivables.pay', selectedInvoice.id), {
            onSuccess: () => {
                handleClosePaymentModal();
            }
        });
    };

    const handleApproveOrder = (orderId) => {
        if (confirm('Apakah Anda yakin ingin menyetujui pesanan ini? Stok gudang regional Anda akan dikurangi.')) {
            postApprove(route('orders.approve', orderId));
        }
    };

    const handleRejectOrder = (e) => {
        e.preventDefault();
        postReject(route('orders.reject', rejectingOrder.id), {
            onSuccess: () => {
                setRejectingOrder(null);
                setRejectionReason('');
            }
        });
    };

    // Calculate total stock current in warehouse
    const totalCurrentStock = inventories.reduce((sum, item) => sum + item.qty, 0);
    const stockPercentage = territory?.max_stock_capacity > 0 
        ? Math.round((totalCurrentStock / territory.max_stock_capacity) * 100)
        : 0;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                            Gudang Regional — {territory?.name || 'Wilayah Anda'}
                        </h2>
                        <p className="text-sm text-slate-500">
                            Distributor Panel untuk mengelola agen, stok regional, dan transaksi pusat.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <MapPin className="w-3.5 h-3.5" />
                            Kapasitas: {stockPercentage}%
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Distributor Dashboard" />

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
                                    <h3 className="text-amber-900 font-extrabold text-sm uppercase tracking-wide">Peringatan: Stok Regional Menipis!</h3>
                                    <p className="text-amber-800 text-xs font-semibold">Terdapat {lowStockProducts.length} produk di bawah batas aman. Segera lakukan PO ke Pusat untuk menghindari kekosongan barang agen.</p>
                                </div>
                            </div>
                            <Link
                                href={route('orders.create')}
                                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow transition-colors shrink-0"
                            >
                                Re-Stock Sekarang
                            </Link>
                        </div>
                    )}

                    {/* TOP SUMMARY PANELS */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* 1. Regional Stock Capacity Card */}
                        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Kapasitas Stok Wilayah</h3>
                                    <Package className="w-5 h-5 text-indigo-500" />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-extrabold text-slate-800">{totalCurrentStock.toLocaleString('id-ID')}</span>
                                        <span className="text-xs text-slate-400">/ {territory?.max_stock_capacity.toLocaleString('id-ID')} pcs</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                                        <div 
                                            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-indigo-500 to-violet-600"
                                            style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                                <span className="text-slate-500">Batas kapasitas aman</span>
                                <span className="font-bold text-emerald-600">80% Kapasitas</span>
                            </div>
                        </div>

                        {/* 2. Credit Plafond Bar */}
                        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Plafon Kredit Pusat (Tempo)</h3>
                                    <CreditCard className="w-5 h-5 text-blue-500" />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-baseline">
                                        <div className="text-sm text-slate-500">Sisa Kredit</div>
                                        <div className="text-2xl font-extrabold text-slate-800">
                                            {formatIDR(creditInfo.credit_remaining)}
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                        <div 
                                            className="h-full rounded-full bg-blue-600"
                                            style={{ 
                                                width: `${creditInfo.credit_limit > 0 ? (creditInfo.credit_used / creditInfo.credit_limit) * 100 : 0}%` 
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-400">
                                        <span>Terpakai: {formatIDR(creditInfo.credit_used)}</span>
                                        <span>Limit: {formatIDR(creditInfo.credit_limit)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-2 text-[10px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg p-2 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                Pembelian Tempo dibatasi sisa kredit aktif Anda.
                            </div>
                        </div>

                        {/* 3. Low Stock Alerts Widget */}
                        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Produk Stok Menipis</h3>
                                    <AlertTriangle className={`w-5 h-5 ${lowStockProducts.length > 0 ? 'text-rose-500 animate-bounce' : 'text-slate-400'}`} />
                                </div>
                                
                                <div className="space-y-2 overflow-y-auto max-h-[100px] pr-1">
                                    {lowStockProducts.length > 0 ? (
                                        lowStockProducts.map((low) => (
                                            <div key={low.id} className="flex justify-between items-center text-xs">
                                                <span className="font-semibold text-slate-700">{low.product.name}</span>
                                                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                                                    {low.qty} pcs
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-6 text-slate-400 text-xs">Semua produk dalam batas aman stok.</div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <Link
                                    href={route('orders.create')}
                                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                                >
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    Beli Stok ke Pusat (PO)
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* MID ROW: PENDING AGENT ORDERS */}
                    <div className="glass-card rounded-3xl p-6 space-y-4">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-indigo-500" />
                                Verifikasi Order Agen Resmi (Pending)
                            </h3>
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                {pendingAgentOrders.length} Butuh Tindakan
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b text-slate-400 font-bold">
                                        <th className="py-3">No. Order</th>
                                        <th className="py-3">Agen Pembeli</th>
                                        <th className="py-3">Metode Pembayaran</th>
                                        <th className="py-3">Rincian Barang</th>
                                        <th className="py-3 text-right">Total Transaksi</th>
                                        <th className="py-3 text-center">Aksi Verifikasi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-slate-700">
                                    {pendingAgentOrders.length > 0 ? (
                                        pendingAgentOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-slate-50/50">
                                                <td className="py-4 font-bold text-slate-800">{order.order_number}</td>
                                                <td className="py-4">
                                                    <span className="font-semibold">{order.buyer?.name}</span>
                                                    <span className="block text-[10px] text-slate-400">{order.buyer?.phone}</span>
                                                </td>
                                                <td className="py-4">
                                                    <span className="px-2 py-0.5 rounded font-bold uppercase bg-slate-100 text-slate-700">
                                                        {order.payment_type}
                                                    </span>
                                                </td>
                                                <td className="py-4 max-w-[200px] truncate">
                                                    {order.items?.map(i => `${i.product?.name} (${i.qty} pcs)`).join(', ')}
                                                </td>
                                                <td className="py-4 font-extrabold text-right text-slate-800">
                                                    {formatIDR(order.total)}
                                                </td>
                                                <td className="py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleApproveOrder(order.id)}
                                                            className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg border border-emerald-200 transition-colors"
                                                            title="Setujui & Kurangi Stok"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setRejectingOrder(order)}
                                                            className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg border border-rose-200 transition-colors"
                                                            title="Tolak Order"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-12 text-slate-400">Belum ada PO masuk dari agen Anda yang pending.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* TWO COLUMN BOTTOM ROW: CENTRAL INVOICES & ANNOUNCEMENTS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* Central Receivables / Invoices to Pusat */}
                        <div className="glass-card rounded-3xl p-6 space-y-4">
                            <div className="flex justify-between items-center border-b pb-3">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-500" />
                                    Tagihan & Cicilan ke Pusat
                                </h3>
                                <Link
                                    href={route('receivables.index')}
                                    className="text-xs text-indigo-600 hover:underline font-semibold"
                                >
                                    Selengkapnya
                                </Link>
                            </div>

                            <div className="space-y-4 overflow-y-auto max-h-[300px] pr-1">
                                {receivables.length > 0 ? (
                                    receivables.map((rec) => (
                                        <div key={rec.id} className="border border-slate-100 rounded-2xl p-4 space-y-3 bg-white">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-xs font-bold text-slate-800">{rec.invoice_number}</span>
                                                    <span className="block text-[10px] text-slate-400">Order: {rec.order?.order_number}</span>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                                                    ${rec.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 
                                                      rec.status === 'partially_paid' ? 'bg-blue-100 text-blue-800' : 
                                                      rec.status === 'overdue' ? 'bg-rose-100 text-rose-800' : 
                                                      'bg-slate-100 text-slate-800'}`}
                                                >
                                                    {rec.status}
                                                </span>
                                            </div>

                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500">Sisa Tagihan</span>
                                                <span className="font-extrabold text-slate-800">{formatIDR(rec.remaining_balance)}</span>
                                            </div>

                                            <div className="flex justify-between text-[10px] text-slate-400 border-t pt-2">
                                                <span>Jatuh Tempo: {new Date(rec.due_date).toLocaleDateString('id-ID')}</span>
                                                <span>Invoice: {formatIDR(rec.total_invoice)}</span>
                                            </div>

                                            {rec.remaining_balance > 0 && (
                                                <button
                                                    onClick={() => handleOpenPaymentModal(rec)}
                                                    className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition-colors mt-2"
                                                >
                                                    Bayar Cicilan / Lunas
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-slate-400 text-xs">Tidak ada riwayat tagihan pusat.</div>
                                )}
                            </div>
                        </div>

                        {/* Announcements Feed & Local Inventory List */}
                        <div className="space-y-8">
                            
                            {/* Announcements */}
                            <div className="glass-card rounded-3xl p-6 space-y-4">
                                <h3 className="text-lg font-bold text-slate-800 border-b pb-3 flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-indigo-500" />
                                    Pengumuman Pusat
                                </h3>

                                <div className="space-y-4 overflow-y-auto max-h-[180px] pr-1">
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
                                                <p className="text-xs text-slate-500 line-clamp-2">{ann.body}</p>
                                                
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

                            {/* Local Activity Feed */}
                            <div className="glass-card rounded-3xl p-6 space-y-4">
                                <h3 className="text-lg font-bold text-slate-800 border-b pb-3 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-indigo-500" />
                                    Aktivitas Terakhir Saya
                                </h3>

                                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1 text-xs">
                                    {recentLogs.length > 0 ? (
                                        recentLogs.map((log) => (
                                            <div key={log.id} className="flex gap-2 items-start text-slate-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></div>
                                                <div>
                                                    <p className="font-medium text-slate-800">{log.description}</p>
                                                    <span className="text-[10px] text-slate-400">
                                                        {new Date(log.created_at).toLocaleDateString('id-ID')} at {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-slate-400 text-xs">Belum ada log tercatat.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>

            {/* PAYMENT SUBMISSION MODAL */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden border border-slate-100 flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-extrabold text-slate-800 text-base">Konfirmasi Pembayaran Piutang</h3>
                                <p className="text-xs text-slate-500">Invoice: {selectedInvoice.invoice_number}</p>
                            </div>
                            <button
                                onClick={handleClosePaymentModal}
                                className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitPayment} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jumlah Transfer (Rp)</label>
                                <input
                                    type="number"
                                    required
                                    value={payData.amount}
                                    onChange={(e) => setPayData('amount', e.target.value)}
                                    className="w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                    max={selectedInvoice.remaining_balance}
                                    placeholder="Masukkan nilai transfer"
                                />
                                <span className="text-[10px] text-slate-400 mt-1 block">Maksimal: {formatIDR(selectedInvoice.remaining_balance)}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bank Pengirim</label>
                                    <input
                                        type="text"
                                        required
                                        value={payData.bank_name}
                                        onChange={(e) => setPayData('bank_name', e.target.value)}
                                        className="w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                        placeholder="e.g. BCA, BRI"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">No. Rekening Anda</label>
                                    <input
                                        type="text"
                                        required
                                        value={payData.account_number}
                                        onChange={(e) => setPayData('account_number', e.target.value)}
                                        className="w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                        placeholder="No Rekening"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal Transfer</label>
                                <input
                                    type="date"
                                    required
                                    value={payData.transfer_date}
                                    onChange={(e) => setPayData('transfer_date', e.target.value)}
                                    className="w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Upload Bukti Transfer (Image)</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        required
                                        accept="image/*"
                                        onChange={(e) => setPayData('payment_proof', e.target.files[0])}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full"
                                    />
                                    <Upload className="w-8 h-8 text-slate-400 mb-2 stroke-1" />
                                    <span className="text-xs text-slate-600 font-semibold">
                                        {payData.payment_proof ? payData.payment_proof.name : 'Pilih file gambar bukti transfer'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 mt-1">Format JPG, PNG max 2MB</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={payProcessing}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-600/10 transition-colors duration-150 disabled:opacity-50"
                            >
                                {payProcessing ? 'Mengirim...' : 'Submit Bukti Pembayaran'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* REJECTION REASON DIALOG */}
            {rejectingOrder && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden border border-slate-100">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-extrabold text-slate-800 text-base">Alasan Penolakan Order</h3>
                                <p className="text-xs text-slate-500">Order: {rejectingOrder.order_number}</p>
                            </div>
                            <button
                                onClick={() => setRejectingOrder(null)}
                                className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleRejectOrder} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deskripsi Penolakan</label>
                                <textarea
                                    required
                                    rows="3"
                                    value={rejectionReason}
                                    onChange={(e) => {
                                        setRejectionReason(e.target.value);
                                        setPayData('reason', e.target.value); // Sync to forms if needed
                                    }}
                                    className="w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                    placeholder="Tulis alasan penolakan..."
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setRejectingOrder(null)}
                                    className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={rejectProcessing}
                                    className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition-colors"
                                >
                                    Tolak Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
