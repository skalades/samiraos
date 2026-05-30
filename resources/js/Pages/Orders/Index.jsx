import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { formatIDR } from '@/lib/formatters';

import { ORDER_STATUS, ORDER_STATUS_STEPS } from '@/lib/constants';

import {
    ShoppingBag, 
    Search, 
    Eye, 
    Plus, 
    ArrowLeftRight, 
    ChevronLeft, 
    ChevronRight,
    Filter
} from 'lucide-react';

export default function OrdersIndex({ orders, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('orders.index'), { search, status }, { preserveState: true });
    };

    const handleStatusFilter = (newStatus) => {
        setStatus(newStatus);
        router.get(route('orders.index'), { search, status: newStatus }, { preserveState: true });
    };


    const statusTabs = [
        { key: 'all', label: 'Semua' },
        { key: 'pending', label: 'Pending' },
        { key: 'approved', label: 'Disetujui' },
        { key: 'processing', label: 'Diproses' },
        { key: 'shipped', label: 'Dikirim' },
        { key: 'delivered', label: 'Diterima' },
        { key: 'rejected', label: 'Ditolak' },
        { key: 'cancelled', label: 'Dibatalkan' }
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                            Daftar Purchase Order (PO)
                        </h2>
                        <p className="text-sm text-slate-500">
                            Kelola pesanan barang antar jaringan distribusi.
                        </p>
                    </div>
                    <div>
                        {route().current('orders.index') && (
                            <Link
                                href={route('orders.create')}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                            >
                                <Plus className="w-4 h-4" />
                                Buat PO Baru
                            </Link>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Purchase Orders" />

            <div className="py-8 bg-slate-50 min-h-[calc(100vh-6.5rem)]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* SEARCH & FILTERS BAR */}
                    <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        
                        {/* Status tabs */}
                        <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                            {statusTabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => handleStatusFilter(tab.key)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors
                                        ${status === tab.key 
                                            ? 'bg-indigo-600 text-white' 
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Search input */}
                        <form onSubmit={handleSearch} className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                <input
                                    type="text"
                                    placeholder="Cari nomor PO..."
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

                    {/* PO TABLE LIST */}
                    <div className="glass-card rounded-3xl p-6 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b text-slate-400 font-bold">
                                        <th className="py-3.5">Nomor PO</th>
                                        <th className="py-3.5">Tanggal Buat</th>
                                        <th className="py-3.5">Pembeli (Buyer)</th>
                                        <th className="py-3.5">Penjual (Seller)</th>
                                        <th className="py-3.5">Metode</th>
                                        <th className="py-3.5 text-right">Total Transaksi</th>
                                        <th className="py-3.5">Status</th>
                                        <th className="py-3.5 text-center">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-slate-700">
                                    {orders.data.length > 0 ? (
                                        orders.data.map((order) => (
                                            <tr key={order.id} className="hover:bg-slate-50/30">
                                                <td className="py-4 font-bold text-slate-800">{order.order_number}</td>
                                                <td className="py-4 text-slate-400">
                                                    {new Date(order.created_at).toLocaleDateString('id-ID')}
                                                </td>
                                                <td className="py-4">
                                                    <span className="font-semibold">{order.buyer?.name}</span>
                                                    <span className="block text-[9px] uppercase font-bold text-slate-400">{order.buyer?.role}</span>
                                                </td>
                                                <td className="py-4">
                                                    <span className="font-semibold">{order.seller?.name || 'Gudang Pusat (Sami Raos)'}</span>
                                                    <span className="block text-[9px] uppercase font-bold text-slate-400">{order.seller ? order.seller.role : 'pusat'}</span>
                                                </td>
                                                <td className="py-4">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                                                        {order.payment_type}
                                                    </span>
                                                </td>
                                                <td className="py-4 font-extrabold text-right text-slate-800">
                                                    {formatIDR(order.total)}
                                                </td>
                                                <td className="py-4">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase
                                                        ${order.status === ORDER_STATUS.DELIVERED ? 'bg-emerald-100 text-emerald-800' : 
                                                          order.status === ORDER_STATUS.SHIPPED ? 'bg-blue-100 text-blue-800 animate-pulse' : 
                                                          order.status === ORDER_STATUS.APPROVED || order.status === ORDER_STATUS.PROCESSING ? 'bg-indigo-100 text-indigo-800' : 
                                                          order.status === ORDER_STATUS.REJECTED || order.status === ORDER_STATUS.CANCELLED ? 'bg-rose-100 text-rose-800' : 
                                                          'bg-slate-100 text-slate-800'}`}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <Link
                                                        href={route('orders.show', order.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-lg border border-indigo-100 transition-colors mx-auto"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        Detail
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center py-16 text-slate-400">Belum ada data Purchase Order (PO).</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION NAVIGATION */}
                        {orders.links && orders.links.length > 3 && (
                            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4 text-xs">
                                <div className="text-slate-500">
                                    Menampilkan <span className="font-semibold text-slate-800">{orders.from || 0}</span> sampai <span className="font-semibold text-slate-800">{orders.to || 0}</span> dari <span className="font-semibold text-slate-800">{orders.total}</span> data
                                </div>
                                <div className="flex items-center gap-1">
                                    {orders.links.map((link, idx) => {
                                        // Skip first and last as text sometimes, use icons
                                        const isPrev = idx === 0;
                                        const isNext = idx === orders.links.length - 1;
                                        
                                        return (
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
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
