import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { formatIDR } from '@/lib/formatters';
import { useState } from 'react';
import { 
    ShoppingBag, 
    ArrowLeft, 
    Plus, 
    Minus, 
    Trash2, 
    CreditCard, 
    AlertTriangle 
} from 'lucide-react';

export default function OrdersCreate({ products, creditInfo, canUseCredit }) {
    const [quantities, setQuantities] = useState({}); // { product_id: qty }

    const { data, setData, post, processing, errors } = useForm({
        items: [], // { product_id, qty }
        payment_type: 'cash',
        notes: ''
    });


    const handleQtyChange = (productId, newQty) => {
        const qty = Math.max(0, newQty);
        const updatedQuantities = { ...quantities, [productId]: qty };
        
        setQuantities(updatedQuantities);

        // Sync with useForm items array
        const formItems = Object.entries(updatedQuantities)
            .filter(([_, q]) => q > 0)
            .map(([pid, q]) => ({
                product_id: parseInt(pid),
                qty: q
            }));
        
        setData('items', formItems);
    };

    const handleRemoveItem = (productId) => {
        handleQtyChange(productId, 0);
    };

    const calculateTotal = () => {
        return data.items.reduce((total, item) => {
            const product = products.find(p => p.id === item.product_id);
            return total + (product ? product.price * item.qty : 0);
        }, 0);
    };

    const submitOrder = (e) => {
        e.preventDefault();
        if (data.items.length === 0) {
            alert('Silakan pilih minimal 1 produk dengan kuantitas lebih dari 0.');
            return;
        }

        const total = calculateTotal();
        if (data.payment_type === 'tempo' && creditInfo && total > creditInfo.credit_remaining) {
            alert('Maaf, total transaksi melebihi sisa plafon kredit tempo Anda!');
            return;
        }

        post(route('orders.store'));
    };

    const cartItems = data.items.map(item => {
        const product = products.find(p => p.id === item.product_id);
        return {
            ...item,
            product
        };
    });

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
                            Buat Purchase Order Baru
                        </h2>
                        <p className="text-sm text-slate-500">
                            Pesan stok produk resmi Sami Raos.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Buat PO Baru" />

            <div className="py-8 bg-slate-50 min-h-[calc(100vh-6.5rem)]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    
                    {errors.error && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
                            {errors.error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* 1. Products Selection Column */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="glass-card rounded-3xl p-6">
                                <h3 className="text-base font-bold text-slate-800 mb-4 border-b pb-3">Daftar Produk Tersedia</h3>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {products.map((p) => {
                                        const currentQty = quantities[p.id] || 0;

                                        return (
                                            <div 
                                                key={p.id} 
                                                className={`border rounded-2xl p-4 flex gap-4 bg-white transition-all duration-200
                                                    ${currentQty > 0 ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-100 hover:border-slate-300'}`}
                                            >
                                                <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 overflow-hidden shrink-0">
                                                    {p.image ? (
                                                        <img src={`/storage/${p.image}`} alt={p.name} className="object-cover w-full h-full" />
                                                    ) : (
                                                        p.name.charAt(0)
                                                    )}
                                                </div>

                                                <div className="flex flex-col justify-between flex-1 space-y-2">
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-sm leading-snug">{p.name}</h4>
                                                        <span className="text-[10px] text-slate-400 block mt-0.5">SKU: {p.sku} / {p.unit}</span>
                                                    </div>

                                                    <div className="flex justify-between items-center">
                                                        <span className="font-extrabold text-sm text-indigo-700">{formatIDR(p.price)}</span>
                                                        
                                                        {/* Qty Selector */}
                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleQtyChange(p.id, currentQty - 5)}
                                                                className="p-1 hover:bg-slate-100 rounded-lg border text-slate-500"
                                                            >
                                                                <Minus className="w-3.5 h-3.5" />
                                                            </button>
                                                            <input
                                                                type="number"
                                                                className="w-12 text-center text-xs border-slate-200 rounded-lg p-1 focus:ring-indigo-500 focus:border-indigo-500"
                                                                value={currentQty}
                                                                onChange={(e) => handleQtyChange(p.id, parseInt(e.target.value) || 0)}
                                                                min="0"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleQtyChange(p.id, currentQty + 5)}
                                                                className="p-1 hover:bg-slate-100 rounded-lg border text-slate-500"
                                                            >
                                                                <Plus className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* 2. Cart & Submission Column */}
                        <div className="space-y-6">
                            
                            {/* Credit Bar for tempo (if distributor) */}
                            {canUseCredit && creditInfo && (
                                <div className="glass-card rounded-3xl p-6 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sisa Kredit Anda</h4>
                                        <CreditCard className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-xl font-extrabold text-slate-800">{formatIDR(creditInfo.credit_remaining)}</div>
                                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                            <div 
                                                className="h-full rounded-full bg-blue-600" 
                                                style={{ width: `${(creditInfo.credit_used / creditInfo.credit_limit) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Cart Summary */}
                            <div className="glass-card rounded-3xl p-6 space-y-6">
                                <h3 className="text-base font-bold text-slate-800 border-b pb-3">Ringkasan Order</h3>

                                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                                    {cartItems.length > 0 ? (
                                        cartItems.map((item) => (
                                            <div key={item.product_id} className="flex justify-between items-center text-xs border-b pb-2 last:border-0 last:pb-0">
                                                <div className="space-y-0.5">
                                                    <span className="font-semibold text-slate-800 leading-tight block">{item.product?.name}</span>
                                                    <span className="text-[10px] text-slate-400">{item.qty} pcs x {formatIDR(item.product?.price || 0)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-800">{formatIDR((item.product?.price || 0) * item.qty)}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(item.product_id)}
                                                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-slate-400 text-xs flex flex-col items-center gap-2">
                                            <ShoppingBag className="w-8 h-8 stroke-1 text-slate-300" />
                                            <span>Keranjang belanja kosong. Silakan pilih produk.</span>
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={submitOrder} className="space-y-4">
                                    
                                    {/* Payment Type */}
                                    {canUseCredit ? (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Metode Pembayaran</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setData('payment_type', 'cash')}
                                                    className={`py-2 text-xs font-semibold rounded-xl border transition-colors
                                                        ${data.payment_type === 'cash' 
                                                            ? 'bg-indigo-600 border-indigo-600 text-white' 
                                                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'}`}
                                                >
                                                    Cash / Transfer
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setData('payment_type', 'tempo')}
                                                    className={`py-2 text-xs font-semibold rounded-xl border transition-colors
                                                        ${data.payment_type === 'tempo' 
                                                            ? 'bg-indigo-600 border-indigo-600 text-white' 
                                                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'}`}
                                                >
                                                    Tempo / Piutang
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Metode Pembayaran</label>
                                            <span className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold block text-center uppercase">
                                                Cash / Transfer Langsung
                                            </span>
                                        </div>
                                    )}

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Catatan Pesanan</label>
                                        <textarea
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            rows="2"
                                            className="w-full text-xs border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                            placeholder="Tulis instruksi tambahan..."
                                        />
                                    </div>

                                    {/* Total */}
                                    <div className="border-t pt-4 flex justify-between items-baseline">
                                        <span className="text-xs font-semibold text-slate-500">Total Pembelian</span>
                                        <span className="text-xl font-extrabold text-indigo-700">{formatIDR(calculateTotal())}</span>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={processing || data.items.length === 0}
                                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-600/10 transition-colors duration-150 disabled:opacity-50"
                                    >
                                        {processing ? 'Memproses PO...' : 'Kirim Purchase Order'}
                                    </button>

                                </form>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
