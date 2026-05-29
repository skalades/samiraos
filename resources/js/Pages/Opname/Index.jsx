import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ClipboardList, Plus, X, AlertTriangle } from 'lucide-react';

export default function OpnameIndex({ opnames, products }) {
    const [showModal, setShowModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: '',
        actual_qty: '',
        type: 'opname',
        reason: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('stock-opnames.store'), {
            onSuccess: () => {
                setShowModal(false);
                reset();
                alert('Laporan berhasil disimpan.');
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                            Modul Stock Opname & Lapor Produk Rusak
                        </h2>
                        <p className="text-sm text-slate-500">
                            Kelola penyesuaian stok, pelaporan barang *reject*, dan audit fisik gudang.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4" /> Buat Laporan / Opname
                    </button>
                </div>
            }
        >
            <Head title="Stock Opname" />

            <div className="py-8 bg-slate-50 min-h-[calc(100vh-6.5rem)]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    <div className="glass-card rounded-3xl p-6 overflow-hidden">
                        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-4">
                            <ClipboardList className="w-5 h-5 text-indigo-500" />
                            <h3 className="font-bold text-slate-800">Riwayat Penyesuaian Stok</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b text-slate-400 font-bold">
                                        <th className="py-3.5">Tanggal</th>
                                        <th className="py-3.5">User Pelapor</th>
                                        <th className="py-3.5">Produk</th>
                                        <th className="py-3.5">Jenis</th>
                                        <th className="py-3.5 text-center">Selisih</th>
                                        <th className="py-3.5">Alasan/Keterangan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-slate-700">
                                    {opnames.data.length > 0 ? (
                                        opnames.data.map((opname) => (
                                            <tr key={opname.id} className="hover:bg-slate-50/50">
                                                <td className="py-4 text-slate-500">
                                                    {new Date(opname.created_at).toLocaleString('id-ID')}
                                                </td>
                                                <td className="py-4 font-semibold text-slate-800">{opname.user?.name}</td>
                                                <td className="py-4 font-semibold">{opname.product?.name}</td>
                                                <td className="py-4">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                                                        ${opname.type === 'reject' ? 'bg-rose-100 text-rose-800' : 
                                                          opname.type === 'opname' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}
                                                    >
                                                        {opname.type}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-center font-bold">
                                                    <span className={opname.difference < 0 ? 'text-rose-600' : opname.difference > 0 ? 'text-emerald-600' : 'text-slate-600'}>
                                                        {opname.difference > 0 ? '+' : ''}{opname.difference}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-slate-500 italic max-w-xs truncate">
                                                    {opname.reason || '-'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-12 text-slate-400">Belum ada data Stock Opname.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL FORM */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden border border-slate-100">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-extrabold text-slate-800 text-base">Buat Laporan Stok</h3>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Produk</label>
                                <select 
                                    className="w-full text-sm rounded-xl border-slate-200"
                                    value={data.product_id}
                                    onChange={e => setData('product_id', e.target.value)}
                                    required
                                >
                                    <option value="">-- Pilih Produk --</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Jenis Laporan</label>
                                <select 
                                    className="w-full text-sm rounded-xl border-slate-200"
                                    value={data.type}
                                    onChange={e => setData('type', e.target.value)}
                                >
                                    <option value="opname">Stock Opname (Penyesuaian Fisik)</option>
                                    <option value="reject">Produk Rusak (Reject / Basi)</option>
                                    <option value="adjustment">Penyesuaian Sistem (Lainnya)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Stok Aktual Tersedia (Yang Bisa Dijual)</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    className="w-full text-sm rounded-xl border-slate-200"
                                    value={data.actual_qty}
                                    onChange={e => setData('actual_qty', e.target.value)}
                                    required
                                />
                                {data.type === 'reject' && (
                                    <p className="text-[10px] text-rose-500 mt-1 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3"/> Masukkan jumlah sisa yang BAIK, barang rusak akan mengurangi stok sistem.
                                    </p>
                                )}
                            </div>

                            {(data.type === 'reject' || data.type === 'adjustment') && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Alasan</label>
                                    <textarea 
                                        className="w-full text-sm rounded-xl border-slate-200"
                                        rows="2"
                                        value={data.reason}
                                        onChange={e => setData('reason', e.target.value)}
                                        required
                                        placeholder="Misal: 5 pcs kemasan bocor."
                                    />
                                </div>
                            )}

                            <div className="pt-2">
                                <button type="submit" disabled={processing} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 disabled:opacity-50">
                                    Simpan Laporan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
