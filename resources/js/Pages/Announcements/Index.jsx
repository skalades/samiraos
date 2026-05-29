import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Megaphone, 
    Plus, 
    Trash2, 
    Download, 
    FileText, 
    Calendar,
    Users,
    AlertCircle,
    BellRing
} from 'lucide-react';

export default function AnnouncementsIndex({ announcements }) {
    const handleDelete = (id, title) => {
        if (confirm(`Apakah Anda yakin ingin menonaktifkan/menghapus pengumuman "${title}"?`)) {
            router.delete(route('announcements.destroy', id));
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Intl.DateTimeFormat('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(new Date(dateString));
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'info':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'warning':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'promo':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'urgent':
                return 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse';
            default:
                return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const getTargetRoleLabel = (role) => {
        switch (role) {
            case 'all':
                return 'Semua Jaringan';
            case 'distributor':
                return 'Distributor Saja';
            case 'agen':
                return 'Agen Saja';
            default:
                return role;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
                            <Megaphone className="w-6 h-6 text-indigo-600" />
                            Broadcast & Pengumuman
                        </h2>
                        <p className="text-sm text-slate-500">
                            Kelola pesan informasi, promo, dan peringatan penting untuk seluruh distributor dan agen.
                        </p>
                    </div>
                    <div>
                        <Link
                            href={route('announcements.create')}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" />
                            Buat Pengumuman Baru
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Broadcast Pengumuman" />

            <div className="py-8 bg-slate-50 min-h-[calc(100vh-6.5rem)]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    {/* FEED PANEL */}
                    <div className="glass-card rounded-3xl p-6 overflow-hidden">
                        <div className="flex items-center justify-between border-b pb-4 mb-4">
                            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <BellRing className="w-5 h-5 text-indigo-500" />
                                Riwayat Broadcast Aktif
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b text-slate-400 font-bold">
                                        <th className="py-3.5">Judul & Isi Pengumuman</th>
                                        <th className="py-3.5">Kategori</th>
                                        <th className="py-3.5">Target Audiens</th>
                                        <th className="py-3.5">Pengirim</th>
                                        <th className="py-3.5">Waktu Rilis</th>
                                        <th className="py-3.5">Kadaluarsa</th>
                                        <th className="py-3.5">Lampiran</th>
                                        <th className="py-3.5 text-center">Status</th>
                                        <th className="py-3.5 text-center">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-slate-700">
                                    {announcements.data.length > 0 ? (
                                        announcements.data.map((ann) => {
                                            const isExpired = ann.expires_at && new Date(ann.expires_at) < new Date();
                                            const isActive = ann.is_active && !isExpired;

                                            return (
                                                <tr key={ann.id} className="hover:bg-slate-50/30">
                                                    <td className="py-4 max-w-md">
                                                        <div className="font-bold text-slate-800 mb-1 leading-snug">
                                                            {ann.title}
                                                        </div>
                                                        <div className="text-slate-500 line-clamp-2 leading-relaxed">
                                                            {ann.body}
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase ${getTypeColor(ann.type)}`}>
                                                            {ann.type}
                                                        </span>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                                            <Users className="w-3.5 h-3.5 text-slate-400" />
                                                            {getTargetRoleLabel(ann.target_role)}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 font-semibold text-slate-600">
                                                        {ann.publisher?.name || 'Sistem'}
                                                    </td>
                                                    <td className="py-4 text-slate-500 whitespace-nowrap">
                                                        {formatDate(ann.published_at || ann.created_at)}
                                                    </td>
                                                    <td className="py-4 text-slate-500 whitespace-nowrap">
                                                        {ann.expires_at ? (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                                {formatDate(ann.expires_at)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 font-medium">Selamanya</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4">
                                                        {ann.attachment ? (
                                                            <a
                                                                href={`/storage/${ann.attachment}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold transition-colors"
                                                                title="Unduh Lampiran"
                                                            >
                                                                <Download className="w-3.5 h-3.5" />
                                                                <FileText className="w-3.5 h-3.5" />
                                                            </a>
                                                        ) : (
                                                            <span className="text-slate-300">-</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border
                                                            ${isActive 
                                                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                                                                : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                                                        >
                                                            {isActive ? 'Aktif' : isExpired ? 'Expired' : 'Non-aktif'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-center">
                                                        {ann.is_active ? (
                                                            <button
                                                                onClick={() => handleDelete(ann.id, ann.title)}
                                                                className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg border border-rose-200 transition-colors"
                                                                title="Hapus / Nonaktifkan"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        ) : (
                                                            <span className="text-slate-400 font-medium text-[10px]">Disabled</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="9" className="text-center py-16 text-slate-400">
                                                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                                Belum ada riwayat broadcast pengumuman.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        {announcements.links && announcements.links.length > 3 && (
                            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4 text-xs">
                                <div className="text-slate-500">
                                    Menampilkan <span className="font-semibold text-slate-800">{announcements.from || 0}</span> sampai <span className="font-semibold text-slate-800">{announcements.to || 0}</span> dari <span className="font-semibold text-slate-800">{announcements.total}</span> data
                                </div>
                                <div className="flex items-center gap-1">
                                    {announcements.links.map((link, idx) => (
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
