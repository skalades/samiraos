import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Upload, 
    Save, 
    AlertTriangle 
} from 'lucide-react';

export default function ProductsCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        sku: '',
        description: '',
        unit: 'box',
        weight_grams: '',
        image: null,
        price_pusat: '',
        price_distributor: '',
        price_agen: ''
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('products.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Link
                        href={route('products.index')}
                        className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                            Tambah Produk Baru
                        </h2>
                        <p className="text-sm text-slate-500">
                            Masukkan detail spesifikasi produk dan struktur harga 3-tier.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Tambah Produk Baru" />

            <div className="py-8 bg-slate-50 min-h-[calc(100vh-6.5rem)]">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    
                    <form onSubmit={submit} className="glass-card rounded-3xl p-6 space-y-6">
                        
                        {/* 1. Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2">Informasi Produk</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Nama Produk *</label>
                                    <input
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-200 focus:ring-indigo-500"
                                        placeholder="e.g. Keripik Bawang Sami Raos 200g"
                                    />
                                    {errors.name && <span className="text-[10px] text-rose-600 mt-1 block">{errors.name}</span>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Kode SKU *</label>
                                    <input
                                        type="text"
                                        required
                                        value={data.sku}
                                        onChange={(e) => setData('sku', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-200 focus:ring-indigo-500"
                                        placeholder="e.g. SR-KPB-200"
                                    />
                                    {errors.sku && <span className="text-[10px] text-rose-600 mt-1 block">{errors.sku}</span>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">Deskripsi Produk</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows="3"
                                    className="w-full text-xs border border-slate-200 rounded-xl focus:ring-indigo-500"
                                    placeholder="Tulis spesifikasi atau deskripsi singkat produk..."
                                />
                                {errors.description && <span className="text-[10px] text-rose-600 mt-1 block">{errors.description}</span>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Satuan Unit *</label>
                                    <input
                                        type="text"
                                        required
                                        value={data.unit}
                                        onChange={(e) => setData('unit', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-200 focus:ring-indigo-500"
                                        placeholder="e.g. box, pack, pcs"
                                    />
                                    {errors.unit && <span className="text-[10px] text-rose-600 mt-1 block">{errors.unit}</span>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Berat (Gram)</label>
                                    <input
                                        type="number"
                                        value={data.weight_grams}
                                        onChange={(e) => setData('weight_grams', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-200 focus:ring-indigo-500"
                                        placeholder="e.g. 200"
                                    />
                                    {errors.weight_grams && <span className="text-[10px] text-rose-600 mt-1 block">{errors.weight_grams}</span>}
                                </div>
                            </div>
                        </div>

                        {/* 2. Three Tier Pricing */}
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2">Struktur Harga Grosir (3-Tier)</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Harga Pusat (Pusat ke Dist) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={data.price_pusat}
                                        onChange={(e) => setData('price_pusat', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-200 focus:ring-indigo-500 font-semibold"
                                        placeholder="e.g. 10000"
                                    />
                                    {errors.price_pusat && <span className="text-[10px] text-rose-600 mt-1 block">{errors.price_pusat}</span>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Harga Distributor (Dist ke Agen) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={data.price_distributor}
                                        onChange={(e) => setData('price_distributor', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-200 focus:ring-indigo-500 font-semibold text-indigo-700"
                                        placeholder="e.g. 12000"
                                    />
                                    {errors.price_distributor && <span className="text-[10px] text-rose-600 mt-1 block">{errors.price_distributor}</span>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Harga Agen (Agen ke End User) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={data.price_agen}
                                        onChange={(e) => setData('price_agen', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-200 focus:ring-indigo-500 font-semibold text-emerald-700"
                                        placeholder="e.g. 15000"
                                    />
                                    {errors.price_agen && <span className="text-[10px] text-rose-600 mt-1 block">{errors.price_agen}</span>}
                                </div>
                            </div>
                        </div>

                        {/* 3. Product Image File */}
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2">Foto Produk</h3>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">Upload Gambar Produk</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('image', e.target.files[0])}
                                    className="w-full text-xs border rounded-xl p-2 bg-slate-50"
                                />
                                {errors.image && <span className="text-[10px] text-rose-600 mt-1 block">{errors.image}</span>}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6 border-t flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition-all duration-150 flex items-center gap-1.5"
                            >
                                <Save className="w-4 h-4" />
                                {processing ? 'Menyimpan...' : 'Simpan Produk Baru'}
                            </button>
                        </div>

                    </form>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
