import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Activity, 
    Search, 
    Calendar, 
    User, 
    Monitor, 
    Filter,
    ArrowLeftRight
} from 'lucide-react';

export default function ActivityLogsIndex({ logs, actionTypes, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [actionType, setActionType] = useState(filters.action_type || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('activity-logs.index'), {
            search,
            action_type: actionType,
            date_from: dateFrom,
            date_to: dateTo
        }, { preserveState: true });
    };

    const handleClearFilters = () => {
        setSearch('');
        setActionType('');
        setDateFrom('');
        setDateTo('');
        router.get(route('activity-logs.index'), {}, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                        Audit Trail / Log Aktivitas
                    </h2>
                    <p className="text-sm text-slate-500">
                        Catatan log audit otomatis untuk menjamin integritas dan keamanan transaksi.
                    </p>
                </div>
            }
        >
            <Head title="Audit Trail Logs" />

            <div className="py-8 bg-slate-50 min-h-[calc(100vh-6.5rem)]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* FILTER & CRITERIA BAR */}
                    <form onSubmit={handleFilter} className="glass-card rounded-2xl p-6 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <Filter className="w-4 h-4 text-indigo-500" />
                            Kriteria Pencarian Log
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* Search */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cari Keterangan</label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full text-xs border border-slate-200 rounded-xl focus:ring-indigo-500 p-2"
                                    placeholder="Kata kunci..."
                                />
                            </div>

                            {/* Action Type */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tipe Aksi</label>
                                <select
                                    value={actionType}
                                    onChange={(e) => setActionType(e.target.value)}
                                    className="w-full text-xs border border-slate-200 rounded-xl focus:ring-indigo-500 p-2"
                                >
                                    <option value="">Semua Aksi</option>
                                    {actionTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date From */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Dari Tanggal</label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full text-xs border border-slate-200 rounded-xl focus:ring-indigo-500 p-1.5"
                                />
                            </div>

                            {/* Date To */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Sampai Tanggal</label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full text-xs border border-slate-200 rounded-xl focus:ring-indigo-500 p-1.5"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex items-end gap-2">
                                <button
                                    type="submit"
                                    className="w-1/2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors text-center"
                                >
                                    Filter
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold border border-slate-200 transition-colors text-center"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* LOGS TABLE LIST */}
                    <div className="glass-card rounded-3xl p-6 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b text-slate-400 font-bold">
                                        <th className="py-3.5">Waktu Terjadi</th>
                                        <th className="py-3.5">Pengguna (User)</th>
                                        <th className="py-3.5">Tipe Aksi</th>
                                        <th className="py-3.5">Deskripsi / Keterangan</th>
                                        <th className="py-3.5">IP Address</th>
                                        <th className="py-3.5">User Agent</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-slate-700">
                                    {logs.data.length > 0 ? (
                                        logs.data.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-50/20">
                                                <td className="py-4 text-slate-400 font-medium">
                                                    {new Date(log.created_at).toLocaleString('id-ID')}
                                                </td>
                                                <td className="py-4 font-bold text-slate-800">
                                                    {log.user?.name || 'Sistem'}
                                                    <span className="block text-[9px] text-slate-400 font-semibold uppercase">{log.user?.role || 'SYSTEM'}</span>
                                                </td>
                                                <td className="py-4">
                                                    <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-700">
                                                        {log.action_type}
                                                    </span>
                                                </td>
                                                <td className="py-4 max-w-[300px] truncate" title={log.description}>
                                                    {log.description}
                                                </td>
                                                <td className="py-4 text-slate-500 font-semibold">{log.ip_address || '-'}</td>
                                                <td className="py-4 text-slate-400 max-w-[150px] truncate" title={log.user_agent}>
                                                    {log.user_agent || '-'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-16 text-slate-400">Log audit trail kosong.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        {logs.links && logs.links.length > 3 && (
                            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4 text-xs">
                                <div className="text-slate-500">
                                    Menampilkan <span className="font-semibold text-slate-800">{logs.from || 0}</span> sampai <span className="font-semibold text-slate-800">{logs.to || 0}</span> dari <span className="font-semibold text-slate-800">{logs.total}</span> data
                                </div>
                                <div className="flex items-center gap-1">
                                    {logs.links.map((link, idx) => (
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
