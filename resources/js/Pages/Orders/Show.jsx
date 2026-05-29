import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
    ShoppingBag, 
    ArrowLeft, 
    Calendar, 
    User, 
    Truck, 
    CreditCard, 
    CheckCircle2, 
    XCircle,
    Activity,
    AlertTriangle,
    Eye,
    Check,
    X,
    FileText
} from 'lucide-react';

export default function OrdersShow({ order }) {
    const user = usePage().props.auth.user;
    const [rejectingOrder, setRejectingOrder] = useState(false);
    const [rejectingPaymentId, setRejectingPaymentId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const { post: postApprove, processing: approveProcessing } = useForm();
    const { post: postShip, processing: shipProcessing } = useForm();
    const { post: postDeliver, processing: deliverProcessing } = useForm();
    const { post: postReject, processing: rejectProcessing } = useForm();
    const { post: postVerifyPayment, processing: verifyProcessing } = useForm({
        reason: ''
    });

    const formatIDR = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const handleApprove = () => {
        if (confirm('Apakah Anda yakin ingin menyetujui PO ini? Stok Anda akan dikurangi.')) {
            postApprove(route('orders.approve', order.id));
        }
    };

    const handleShip = () => {
        if (confirm('Apakah Anda yakin ingin mengirim barang untuk PO ini?')) {
            postShip(route('orders.ship', order.id));
        }
    };

    const handleDeliver = () => {
        if (confirm('Konfirmasi bahwa Anda sudah menerima barang pesanan Anda secara lengkap?')) {
            postDeliver(route('orders.deliver', order.id));
        }
    };

    const handleRejectOrder = (e) => {
        e.preventDefault();
        postReject(route('orders.reject', order.id), {
            data: { reason: rejectionReason },
            onSuccess: () => {
                setRejectingOrder(false);
                setRejectionReason('');
            }
        });
    };

    const handleApprovePayment = (paymentId) => {
        if (confirm('Setujui pembayaran ini? Saldo kredit distributor akan dikreditkan kembali.')) {
            postVerifyPayment(route('receivables.payments.approve', paymentId));
        }
    };

    const handleRejectPayment = (e) => {
        e.preventDefault();
        postVerifyPayment(route('receivables.payments.reject', rejectingPaymentId), {
            data: { reason: rejectionReason },
            onSuccess: () => {
                setRejectingPaymentId(null);
                setRejectionReason('');
            }
        });
    };

    // Determine timeline step index
    const steps = ['pending', 'approved', 'processing', 'shipped', 'delivered'];
    const currentStepIndex = steps.indexOf(order.status);

    const isSeller = order.seller_id === user.id || (order.type === 'distributor_to_pusat' && user.role === 'super_admin');
    const isBuyer = order.buyer_id === user.id;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Link
                        href={route('orders.index')}
                        className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                            Detail PO: {order.order_number}
                        </h2>
                        <p className="text-sm text-slate-500">
                            Rincian status, item pemesanan, dan log aktivitas transaksi.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`PO ${order.order_number}`} />

            <div className="py-8 bg-slate-50 min-h-[calc(100vh-6.5rem)]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">

                    {/* STATUS TIMELINE PROGRESS BAR */}
                    {order.status !== 'rejected' && order.status !== 'cancelled' && (
                        <div className="glass-card rounded-3xl p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                {steps.map((step, idx) => {
                                    const isActive = idx <= currentStepIndex;
                                    const isCurrent = idx === currentStepIndex;
                                    return (
                                        <div key={step} className="flex-1 flex items-center gap-3 relative">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                                ${isCurrent ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 
                                                  isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}
                                            >
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <div className={`text-xs font-bold capitalize ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                                                    {step === 'delivered' ? 'Diterima' : step === 'shipped' ? 'Dikirim' : step}
                                                </div>
                                                <span className="text-[10px] text-slate-400">
                                                    {isCurrent ? 'Status Saat Ini' : isActive ? 'Selesai' : 'Menunggu'}
                                                </span>
                                            </div>
                                            {idx < steps.length - 1 && (
                                                <div className="hidden lg:block absolute left-8 right-0 top-4 h-[2px] bg-slate-100 -z-10" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* REJECTED / CANCELLED HERO */}
                    {(order.status === 'rejected' || order.status === 'cancelled') && (
                        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 flex items-start gap-4">
                            <XCircle className="w-10 h-10 text-rose-600 shrink-0" />
                            <div className="space-y-1">
                                <h3 className="font-extrabold text-rose-800 text-base">Pesanan Ini {order.status === 'rejected' ? 'Ditolak' : 'Dibatalkan'}</h3>
                                <p className="text-sm text-rose-700 leading-relaxed">
                                    Status PO saat ini tidak aktif. 
                                    {order.notes && ` Catatan Penolakan: "${order.notes}"`}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* 1. Left Side: PO Meta Info & Line Items */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Meta Card */}
                            <div className="glass-card rounded-3xl p-6 space-y-4">
                                <h3 className="text-base font-bold text-slate-800 border-b pb-3 mb-2">Informasi Pengiriman & Pembayaran</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span><strong>Tanggal Dibuat:</strong> {new Date(order.created_at).toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-slate-400" />
                                            <span><strong>Pembeli (Buyer):</strong> {order.buyer?.name} ({order.buyer?.role})</span>
                                        </div>
                                        {order.notes && (
                                            <div className="flex items-start gap-2">
                                                <Activity className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                                <span><strong>Catatan:</strong> "{order.notes}"</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Truck className="w-4 h-4 text-slate-400" />
                                            <span><strong>Distributor Penjual:</strong> {order.seller?.name || 'Gudang Pusat Sami Raos'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-slate-400" />
                                            <span><strong>Metode Pembayaran:</strong> <strong className="uppercase">{order.payment_type}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-slate-400" />
                                            <span><strong>Status PO:</strong> <strong className="uppercase text-indigo-700">{order.status}</strong></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Line Items Table */}
                            <div className="glass-card rounded-3xl p-6 space-y-4">
                                <h3 className="text-base font-bold text-slate-800 border-b pb-3">Daftar Item Barang</h3>
                                
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b text-slate-400 font-bold">
                                                <th className="py-2.5">Nama Produk</th>
                                                <th className="py-2.5">SKU</th>
                                                <th className="py-2.5 text-center">Kuantitas</th>
                                                <th className="py-2.5 text-right">Harga Satuan</th>
                                                <th className="py-2.5 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y text-slate-700">
                                            {order.items?.map((item) => (
                                                <tr key={item.id} className="hover:bg-slate-50/20">
                                                    <td className="py-3 font-semibold text-slate-800">{item.product?.name}</td>
                                                    <td className="py-3 text-slate-400">{item.product?.sku}</td>
                                                    <td className="py-3 text-center font-bold">{item.qty} {item.product?.unit || 'pcs'}</td>
                                                    <td className="py-3 text-right font-medium">{formatIDR(item.unit_price)}</td>
                                                    <td className="py-3 text-right font-extrabold text-slate-800">{formatIDR(item.subtotal)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="border-t pt-4 flex flex-col items-end gap-2 text-xs">
                                    <div className="flex gap-12 justify-between w-64">
                                        <span className="text-slate-500">Subtotal</span>
                                        <span className="font-semibold text-slate-800">{formatIDR(order.subtotal)}</span>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="flex gap-12 justify-between w-64 text-rose-600">
                                            <span>Diskon</span>
                                            <span>-{formatIDR(order.discount)}</span>
                                        </div>
                                    )}
                                    <div className="flex gap-12 justify-between w-64 border-t pt-2 text-sm">
                                        <span className="font-bold text-slate-800">Total Transaksi</span>
                                        <span className="font-extrabold text-indigo-700">{formatIDR(order.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Right Side: Workflow Actions & Invoice (if tempo) */}
                        <div className="space-y-6">
                            
                            {/* Workflow Actions */}
                            {order.status !== 'rejected' && order.status !== 'cancelled' && (
                                <div className="glass-card rounded-3xl p-6 space-y-4">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tindakan Persetujuan</h3>
                                    
                                    <div className="space-y-2">
                                        {/* Seller Verification Action (Approve / Reject) */}
                                        {isSeller && order.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={handleApprove}
                                                    disabled={approveProcessing}
                                                    className="w-full flex items-center justify-center gap-1.5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/10"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Setujui & Proses PO
                                                </button>
                                                <button
                                                    onClick={() => setRejectingOrder(true)}
                                                    className="w-full flex items-center justify-center gap-1.5 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold border border-rose-200 transition-all"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Tolak Pesanan Ini
                                                </button>
                                            </>
                                        )}

                                        {/* Shipping Action for Pusat */}
                                        {user.role === 'super_admin' && order.type === 'distributor_to_pusat' && order.status === 'approved' && (
                                            <button
                                                onClick={handleShip}
                                                disabled={shipProcessing}
                                                className="w-full flex items-center justify-center gap-1.5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10"
                                            >
                                                <Truck className="w-4 h-4" />
                                                Tandai Barang Dikirim (Kirim)
                                            </button>
                                        )}

                                        {/* Print Label Action (For Sellers) */}
                                        {isSeller && ['approved', 'processing', 'shipped', 'delivered'].includes(order.status) && (
                                            <a
                                                href={route('orders.print-label', order.id)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full flex items-center justify-center gap-1.5 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-md mt-2"
                                            >
                                                <FileText className="w-4 h-4" />
                                                Cetak Label Pengiriman (Thermal)
                                            </a>
                                        )}

                                        {/* Delivery/Received Confirmation for Buyer */}
                                        {isBuyer && order.status === 'shipped' && (
                                            <button
                                                onClick={handleDeliver}
                                                disabled={deliverProcessing}
                                                className="w-full flex items-center justify-center gap-1.5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/10"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                Barang Diterima & Selesai
                                            </button>
                                        )}

                                        {/* Default placeholder if no action */}
                                        {!(isSeller && order.status === 'pending') &&
                                         !(user.role === 'super_admin' && order.type === 'distributor_to_pusat' && order.status === 'approved') &&
                                         !(isBuyer && order.status === 'shipped') && (
                                            <p className="text-xs text-slate-400 text-center py-4">Tidak ada tindakan persetujuan yang tertunda untuk status ini.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Tempo Invoice & Payment Verification details */}
                            {order.payment_type === 'tempo' && order.receivable && (
                                <div className="glass-card rounded-3xl p-6 space-y-6">
                                    <div className="flex justify-between items-center border-b pb-3">
                                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-blue-500" />
                                            Cicilan Piutang Pusat
                                        </h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                                            ${order.receivable.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}
                                        >
                                            {order.receivable.status}
                                        </span>
                                    </div>

                                    <div className="space-y-3 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">No. Invoice</span>
                                            <span className="font-semibold text-slate-800">{order.receivable.invoice_number}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Jatuh Tempo</span>
                                            <span className="font-semibold text-slate-800">{new Date(order.receivable.due_date).toLocaleDateString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2">
                                            <span className="text-slate-500">Sisa Tagihan</span>
                                            <span className="font-extrabold text-rose-700">{formatIDR(order.receivable.remaining_balance)}</span>
                                        </div>
                                    </div>

                                    {/* Payments proof uploaded list */}
                                    <div className="space-y-4 border-t pt-4">
                                        <h4 className="text-xs font-bold text-slate-800">Riwayat Setoran</h4>
                                        {order.receivable.payments && order.receivable.payments.length > 0 ? (
                                            order.receivable.payments.map((payment) => (
                                                <div key={payment.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-extrabold text-slate-800">{formatIDR(payment.amount)}</span>
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                                                            ${payment.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 
                                                              payment.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 
                                                              'bg-amber-100 text-amber-800'}`}
                                                        >
                                                            {payment.status}
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 flex justify-between">
                                                        <span>{payment.bank_name} - {payment.account_number}</span>
                                                        <span>{new Date(payment.transfer_date).toLocaleDateString('id-ID')}</span>
                                                    </div>

                                                    {payment.payment_proof && (
                                                        <a 
                                                            href={`/storage/${payment.payment_proof}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            Lihat Bukti Transfer
                                                        </a>
                                                    )}

                                                    {/* Admin Approval of Payment Proof */}
                                                    {user.role === 'super_admin' && payment.status === 'pending_verification' && (
                                                        <div className="flex gap-2 pt-2">
                                                            <button
                                                                onClick={() => handleApprovePayment(payment.id)}
                                                                className="w-1/2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-colors"
                                                            >
                                                                Terima Setor
                                                            </button>
                                                            <button
                                                                onClick={() => setRejectingPaymentId(payment.id)}
                                                                className="w-1/2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[10px] border border-rose-200 rounded-lg transition-colors"
                                                            >
                                                                Tolak Setor
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-6 text-slate-400 text-xs">Belum ada setoran diunggah.</div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </div>

            {/* ORDER REJECTION DIALOG */}
            {rejectingOrder && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden border border-slate-100">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-extrabold text-slate-800 text-base">Alasan Penolakan Order</h3>
                                <p className="text-xs text-slate-500">PO: {order.order_number}</p>
                            </div>
                            <button
                                onClick={() => setRejectingOrder(false)}
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
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                    placeholder="Tulis alasan penolakan PO..."
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setRejectingOrder(false)}
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

            {/* PAYMENT REJECTION DIALOG */}
            {rejectingPaymentId && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden border border-slate-100">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-extrabold text-slate-800 text-base">Tolak Setoran Transfer</h3>
                                <p className="text-xs text-slate-500">Berikan alasan penolakan bukti setoran</p>
                            </div>
                            <button
                                onClick={() => setRejectingPaymentId(null)}
                                className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleRejectPayment} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alasan Penolakan</label>
                                <textarea
                                    required
                                    rows="3"
                                    value={rejectionReason}
                                    onChange={(e) => {
                                        setRejectionReason(e.target.value);
                                        setPayData('reason', e.target.value);
                                    }}
                                    className="w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                    placeholder="e.g. Bukti transfer tidak jelas / nominal tidak sesuai"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setRejectingPaymentId(null)}
                                    className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={verifyProcessing}
                                    className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition-colors"
                                >
                                    Tolak Setoran
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
