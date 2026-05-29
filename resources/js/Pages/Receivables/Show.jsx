import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
    FileText, 
    ArrowLeft, 
    Calendar, 
    User, 
    CreditCard, 
    Upload, 
    Check, 
    X, 
    Eye,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';

export default function ReceivablesShow({ receivable }) {
    const user = usePage().props.auth.user;
    const [rejectingPaymentId, setRejectingPaymentId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // Payment Form (Distributor)
    const { data: payData, setData: setPayData, post: postPay, processing: payProcessing, reset: resetPay, errors: payErrors } = useForm({
        amount: receivable.remaining_balance.toString(),
        bank_name: '',
        account_number: '',
        transfer_date: new Date().toISOString().split('T')[0],
        payment_proof: null
    });

    // Admin Verification Form
    const { post: postVerify, processing: verifyProcessing } = useForm({
        reason: ''
    });

    const formatIDR = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const handleOpenPaymentUpload = () => {
        resetPay();
    };

    const handleUploadPayment = (e) => {
        e.preventDefault();
        postPay(route('receivables.pay', receivable.id));
    };

    const handleApprovePayment = (paymentId) => {
        if (confirm('Apakah Anda yakin ingin menyetujui setoran pembayaran ini? Saldo kredit distributor akan bertambah.')) {
            postVerify(route('receivables.payments.approve', paymentId));
        }
    };

    const handleRejectPayment = (e) => {
        e.preventDefault();
        postVerify(route('receivables.payments.reject', rejectingPaymentId), {
            data: { reason: rejectionReason },
            onSuccess: () => {
                setRejectingPaymentId(null);
                setRejectionReason('');
            }
        });
    };

    const isDistributor = user.role === 'distributor';
    const isAdmin = user.role === 'super_admin';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Link
                        href={route('receivables.index')}
                        className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                            Faktur Piutang: {receivable.invoice_number}
                        </h2>
                        <p className="text-sm text-slate-500">
                            Kelola setoran pembayaran cicilan tempo.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`Faktur ${receivable.invoice_number}`} />

            <div className="py-8 bg-slate-50 min-h-[calc(100vh-6.5rem)]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">

                    {payErrors.error && (
                        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
                            {payErrors.error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* 1. Invoice Details & Goods Summary */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Invoice Meta */}
                            <div className="glass-card rounded-3xl p-6 space-y-4">
                                <h3 className="text-base font-bold text-slate-800 border-b pb-3 mb-2">Metadata Faktur Piutang</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span><strong>Jatuh Tempo:</strong> {new Date(receivable.due_date).toLocaleDateString('id-ID')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-slate-400" />
                                            <span><strong>Debitur (Distributor):</strong> {receivable.distributor?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-slate-400" />
                                            <span><strong>Nomor PO Terkait:</strong> <Link href={route('orders.show', receivable.order_id)} className="text-indigo-600 font-bold hover:underline">{receivable.order?.order_number}</Link></span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span>Nilai Faktur:</span>
                                            <span className="font-semibold text-slate-800">{formatIDR(receivable.total_invoice)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-emerald-600">Telah Dibayar:</span>
                                            <span className="font-semibold text-emerald-600">{formatIDR(receivable.amount_paid)}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2 text-sm">
                                            <span className="font-bold text-slate-800">Sisa Tagihan:</span>
                                            <span className="font-extrabold text-rose-600">{formatIDR(receivable.remaining_balance)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Goods breakdown */}
                            {receivable.order && receivable.order.items && (
                                <div className="glass-card rounded-3xl p-6 space-y-4">
                                    <h3 className="text-base font-bold text-slate-800 border-b pb-3">Rincian Pembelian Barang</h3>
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b text-slate-400 font-bold">
                                                <th className="py-2.5">Produk</th>
                                                <th className="py-2.5">Kuantitas</th>
                                                <th className="py-2.5 text-right">Harga</th>
                                                <th className="py-2.5 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y text-slate-700">
                                            {receivable.order.items.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="py-3 font-semibold text-slate-800">{item.product?.name}</td>
                                                    <td className="py-3 font-bold">{item.qty} {item.product?.unit || 'pcs'}</td>
                                                    <td className="py-3 text-right font-medium">{formatIDR(item.unit_price)}</td>
                                                    <td className="py-3 text-right font-extrabold">{formatIDR(item.subtotal)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* 2. Payments Verification & Upload Form */}
                        <div className="space-y-6">
                            
                            {/* Upload Payment Form (for Distributor, if unpaid/partially paid) */}
                            {isDistributor && receivable.remaining_balance > 0 && (
                                <div className="glass-card rounded-3xl p-6 space-y-4">
                                    <h3 className="text-sm font-bold text-slate-800 border-b pb-3 flex items-center gap-2">
                                        <Upload className="w-4 h-4 text-indigo-500" />
                                        Setor Pembayaran Cicilan
                                    </h3>

                                    <form onSubmit={handleUploadPayment} className="space-y-4 text-xs">
                                        <div>
                                            <label className="block font-bold text-slate-500 uppercase mb-1">Jumlah Bayar (Rp)</label>
                                            <input
                                                type="number"
                                                required
                                                value={payData.amount}
                                                onChange={(e) => setPayData('amount', e.target.value)}
                                                className="w-full text-xs rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                                                max={receivable.remaining_balance}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block font-bold text-slate-500 uppercase mb-1">Bank Pengirim</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={payData.bank_name}
                                                    onChange={(e) => setPayData('bank_name', e.target.value)}
                                                    className="w-full text-xs rounded-xl border-slate-200 focus:ring-indigo-500"
                                                    placeholder="BCA/Mandiri"
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-bold text-slate-500 uppercase mb-1">Rekening Pengirim</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={payData.account_number}
                                                    onChange={(e) => setPayData('account_number', e.target.value)}
                                                    className="w-full text-xs rounded-xl border-slate-200 focus:ring-indigo-500"
                                                    placeholder="No. Rekening"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block font-bold text-slate-500 uppercase mb-1">Tanggal Transfer</label>
                                            <input
                                                type="date"
                                                required
                                                value={payData.transfer_date}
                                                onChange={(e) => setPayData('transfer_date', e.target.value)}
                                                className="w-full text-xs rounded-xl border-slate-200 focus:ring-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block font-bold text-slate-500 uppercase mb-1">Bukti Transfer (Gambar)</label>
                                            <input
                                                type="file"
                                                required
                                                accept="image/*"
                                                onChange={(e) => setPayData('payment_proof', e.target.files[0])}
                                                className="w-full text-xs border rounded-xl p-2 bg-slate-50"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={payProcessing}
                                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-600/10"
                                        >
                                            {payProcessing ? 'Mengirim...' : 'Kirim Setoran'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Payment history & verifier details */}
                            <div className="glass-card rounded-3xl p-6 space-y-4">
                                <h3 className="text-sm font-bold text-slate-800 border-b pb-3">Riwayat Bukti Setoran</h3>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                                    {receivable.payments && receivable.payments.length > 0 ? (
                                        receivable.payments.map((p) => (
                                            <div key={p.id} className="border border-slate-100 rounded-2xl p-4 bg-white space-y-2 text-xs">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-extrabold text-slate-800">{formatIDR(p.amount)}</span>
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase
                                                        ${p.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 
                                                          p.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 
                                                          'bg-amber-100 text-amber-800'}`}
                                                    >
                                                        {p.status}
                                                    </span>
                                                </div>

                                                <div className="text-[10px] text-slate-500">
                                                    <div>Bank: {p.bank_name} - {p.account_number}</div>
                                                    <div>Tgl Transfer: {new Date(p.transfer_date).toLocaleDateString('id-ID')}</div>
                                                    {p.verifier && <div className="mt-1">Diverifikasi oleh: {p.verifier?.name}</div>}
                                                    {p.rejection_reason && <div className="mt-1 text-rose-600">Alasan Tolak: "{p.rejection_reason}"</div>}
                                                </div>

                                                {p.payment_proof && (
                                                    <a 
                                                        href={`/storage/${p.payment_proof}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1 font-semibold pt-1"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        Lihat Bukti Transfer
                                                    </a>
                                                )}

                                                {/* Admin Verification buttons */}
                                                {isAdmin && p.status === 'pending_verification' && (
                                                    <div className="flex gap-2 pt-2">
                                                        <button
                                                            onClick={() => handleApprovePayment(p.id)}
                                                            className="w-1/2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-colors"
                                                        >
                                                            Terima
                                                        </button>
                                                        <button
                                                            onClick={() => setRejectingPaymentId(p.id)}
                                                            className="w-1/2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[10px] border border-rose-200 rounded-lg transition-colors"
                                                        >
                                                            Tolak
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-slate-400 text-xs">Belum ada setoran bayar cicilan.</div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            {/* REJECTION REASON DIALOG */}
            {rejectingPaymentId && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden border border-slate-100">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-extrabold text-slate-800 text-base">Tolak Setoran Transfer</h3>
                                <p className="text-xs text-slate-500">Alasan penolakan setoran cicilan distributor</p>
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
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Catatan Penolakan</label>
                                <textarea
                                    required
                                    rows="3"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                    placeholder="Tulis alasan..."
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
                                    Tolak Bukti
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
