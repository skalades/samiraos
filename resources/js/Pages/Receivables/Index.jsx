import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import TransactionTabs from '@/Components/TransactionTabs';
import { useState } from 'react';
import { formatIDR } from '@/lib/formatters';
import { 
    FileText, 
    Search, 
    Eye, 
    ArrowLeftRight, 
    ChevronLeft, 
    ChevronRight,
    AlertTriangle,
    ShieldAlert
} from 'lucide-react';

export default function ReceivablesIndex({ receivables, summary, filters }) {
    const [status, setStatus] = useState(filters.status || 'all');

    const handleStatusFilter = (newStatus) => {
        setStatus(newStatus);
        router.get(route('receivables.index'), { status: newStatus }, { preserveState: true });
    };


    const statusTabs = [
        { key: 'all', label: 'Semua' },
        { key: 'unpaid', label: 'Belum Bayar' },
        { key: 'partially_paid', label: 'Dibayar Sebagian' },
        { key: 'paid', label: 'Lunas' },
        { key: 'overdue', label: 'Jatuh Tempo' }
    ];

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                        Transaksi
                    </h2>
                    <p className="text-sm text-slate-500">
                        Kelola pesanan barang dan piutang antar jaringan distribusi.
                    </p>
                </div>
            }
        >
            <Head title="Piutang Pusat" />

            <div className="p-8">
                <div className="mx-auto max-w-7xl space-y-6">

                    <TransactionTabs />

                    {/* PIUTANG OVERVIEW WIDGETS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Outstanding Balance */}
                        <div className="glass-card rounded-2xl p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Piutang Berjalan</span>
                                <div className="text-3xl font-extrabold text-slate-800">
                                    {formatIDR(summary.total_unpaid)}
                                </div>
                                <span className="text-[10px] text-slate-400">Total sisa saldo yang belum dilunasi</span>
                            </div>
                            <div className="p-4 rounded-xl bg-indigo-50 text-indigo-600">
                                <FileText className="w-6 h-6" />
                            </div>
                        </div>

                        {/* Overdue Count */}
                        <div className="glass-card rounded-2xl p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Faktur Jatuh Tempo</span>
                                <div className="flex items-center gap-2">
                                    <div className="text-3xl font-extrabold text-slate-800">{summary.total_overdue}</div>
                                    {summary.total_overdue > 0 && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 animate-pulse">
                                            Jatuh Tempo!
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] text-slate-400">Faktur melewati tanggal batas tempo</span>
                            </div>
                            <div className={`p-4 rounded-xl ${summary.total_overdue > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* FILTER TABS & SEARCH BAR */}
                    <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                    </div>

                    {/* RECEIVABLES TABLE */}
                    <div className="glass-card rounded-3xl p-6 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b text-slate-400 font-bold">
                                        <th className="py-3.5">Nomor Invoice</th>
                                        <th className="py-3.5">Distributor</th>
                                        <th className="py-3.5">Nomor PO</th>
                                        <th className="py-3.5 text-right">Nilai Invoice</th>
                                        <th className="py-3.5 text-right">Telah Dibayar</th>
                                        <th className="py-3.5 text-right">Sisa Tagihan</th>
                                        <th className="py-3.5">Jatuh Tempo</th>
                                        <th className="py-3.5">Status</th>
                                        <th className="py-3.5 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-slate-700">
                                    {receivables.data.length > 0 ? (
                                        receivables.data.map((rec) => (
                                            <tr key={rec.id} className="hover:bg-slate-50/30">
                                                <td className="py-4 font-bold text-slate-800">{rec.invoice_number}</td>
                                                <td className="py-4 font-semibold text-slate-700">{rec.distributor?.name}</td>
                                                <td className="py-4 font-medium text-indigo-600">
                                                    <Link href={route('orders.show', rec.order_id)} className="hover:underline">
                                                        {rec.order?.order_number}
                                                    </Link>
                                                </td>
                                                <td className="py-4 text-right font-semibold">{formatIDR(rec.total_invoice)}</td>
                                                <td className="py-4 text-right text-emerald-600 font-semibold">{formatIDR(rec.amount_paid)}</td>
                                                <td className="py-4 text-right text-rose-600 font-extrabold">{formatIDR(rec.remaining_balance)}</td>
                                                <td className="py-4 text-slate-500">
                                                    {new Date(rec.due_date).toLocaleDateString('id-ID')}
                                                </td>
                                                <td className="py-4">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase
                                                        ${rec.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 
                                                          rec.status === 'partially_paid' ? 'bg-blue-100 text-blue-800' : 
                                                          rec.status === 'overdue' ? 'bg-rose-100 text-rose-800' : 
                                                          'bg-slate-100 text-slate-800'}`}
                                                    >
                                                        {rec.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <Link
                                                        href={route('receivables.show', rec.id)}
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
                                            <td colSpan="9" className="text-center py-16 text-slate-400">Belum ada faktur piutang.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        {receivables.links && receivables.links.length > 3 && (
                            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4 text-xs">
                                <div className="text-slate-500">
                                    Menampilkan <span className="font-semibold text-slate-800">{receivables.from || 0}</span> sampai <span className="font-semibold text-slate-800">{receivables.to || 0}</span> dari <span className="font-semibold text-slate-800">{receivables.total}</span> data
                                </div>
                                <div className="flex items-center gap-1">
                                    {receivables.links.map((link, idx) => (
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
        </AuthenticatedLayout>
    );
}
