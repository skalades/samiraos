import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import ConfirmDialog from '@/Components/ConfirmDialog';
import { formatIDR } from '@/lib/formatters';
import { useState } from 'react';
import { 
    Package, 
    Search, 
    Plus, 
    Edit, 
    Trash2, 
    ChevronLeft, 
    ChevronRight,
    Tag
} from 'lucide-react';

export default function ProductsIndex({ products, filters }) {
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: 'Konfirmasi', message: '', onConfirm: () => {}, danger: false });

    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('products.index'), { search }, { preserveState: true });
    };

    const handleDelete = (id, name) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Konfirmasi Hapus',
            message: `Apakah Anda yakin ingin menghapus produk "${name}"? Tindakan ini menggunakan Soft Delete.`,
            danger: true,
            onConfirm: () => {
                router.delete(route('products.destroy', id));
            }
        });
    };


    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                            Master Katalog Produk
                        </h2>
                        <p className="text-sm text-slate-500">
                            Kelola data produk utama dan struktur harga 3-tier.
                        </p>
                    </div>
                    <div>
                        <Link
                            href={route('products.create')}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah Produk Baru
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Master Produk" />

            <div className="py-8 bg-slate-50 min-h-[calc(100vh-6.5rem)]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* SEARCH INPUT */}
                    <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                <input
                                    type="text"
                                    placeholder="Cari nama atau SKU produk..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                            >
                                Cari
                            </button>
                        </form>
                    </div>

                    {/* PRODUCT TABLE LIST */}
                    <div className="glass-card rounded-3xl p-6 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b text-slate-400 font-bold">
                                        <th className="py-3.5">Gambar / Produk</th>
                                        <th className="py-3.5">SKU</th>
                                        <th className="py-3.5">Unit / Berat</th>
                                        <th className="py-3.5 text-right">Harga Pusat</th>
                                        <th className="py-3.5 text-right">Harga Distributor</th>
                                        <th className="py-3.5 text-right">Harga Agen</th>
                                        <th className="py-3.5 text-center">Status</th>
                                        <th className="py-3.5 text-center">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-slate-700">
                                    {products.data.length > 0 ? (
                                        products.data.map((p) => {
                                            const pricePusat = p.prices.find(pr => pr.tier === 'pusat')?.price ?? 0;
                                            const priceDistributor = p.prices.find(pr => pr.tier === 'distributor')?.price ?? 0;
                                            const priceAgen = p.prices.find(pr => pr.tier === 'agen')?.price ?? 0;

                                            return (
                                                <tr key={p.id} className="hover:bg-slate-50/30">
                                                    <td className="py-4 flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 overflow-hidden">
                                                            {p.image ? (
                                                                <img src={`/storage/${p.image}`} alt={p.name} className="object-cover w-full h-full" />
                                                            ) : (
                                                                p.name.charAt(0)
                                                            )}
                                                        </div>
                                                        <span className="font-bold text-slate-800">{p.name}</span>
                                                    </td>
                                                    <td className="py-4 font-semibold text-slate-700">{p.sku}</td>
                                                    <td className="py-4 text-slate-500">
                                                        {p.unit} ({p.weight_grams ? `${p.weight_grams} g` : '-'})
                                                    </td>
                                                    <td className="py-4 text-right font-semibold text-slate-800">{formatIDR(pricePusat)}</td>
                                                    <td className="py-4 text-right font-semibold text-indigo-600">{formatIDR(priceDistributor)}</td>
                                                    <td className="py-4 text-right font-semibold text-emerald-600">{formatIDR(priceAgen)}</td>
                                                    <td className="py-4 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                                                            ${p.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}
                                                        >
                                                            {p.is_active ? 'Aktif' : 'Non-aktif'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Link
                                                                href={route('products.edit', p.id)}
                                                                className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg border border-indigo-100 transition-colors"
                                                                title="Edit Produk"
                                                            >
                                                                <Edit className="w-3.5 h-3.5" />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(p.id, p.name)}
                                                                className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg border border-rose-200 transition-colors"
                                                                title="Hapus Produk"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center py-16 text-slate-400">Belum ada data produk katalog.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        {products.links && products.links.length > 3 && (
                            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4 text-xs">
                                <div className="text-slate-500">
                                    Menampilkan <span className="font-semibold text-slate-800">{products.from || 0}</span> sampai <span className="font-semibold text-slate-800">{products.to || 0}</span> dari <span className="font-semibold text-slate-800">{products.total}</span> data
                                </div>
                                <div className="flex items-center gap-1">
                                    {products.links.map((link, idx) => (
                                        <Link
                                            key={idx}
                                            href={link.url || '#'}
                                            disabled={!link.url}
                                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center transition-colors
                                                ${link.active 
                                                    ? 'bg-indigo-600 border-indigo-600 text-white' 
                                                    : link.url 
                                                        ? 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200' 
                                                        : 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        
            <ConfirmDialog 
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                danger={confirmDialog.danger}
            />
        </AuthenticatedLayout>
    );
}
