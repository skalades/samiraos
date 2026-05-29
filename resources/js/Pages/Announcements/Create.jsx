import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Send, 
    AlertTriangle, 
    FileUp, 
    Calendar,
    Settings,
    Layers,
    Type
} from 'lucide-react';

export default function AnnouncementsCreate({ types, targetRoles }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        body: '',
        type: 'info',
        target_role: 'all',
        attachment: null,
        expires_at: ''
    });

    const submit = (e) => {
        e.preventDefault();
        
        // Form data is automatically parsed as multipart by Inertia's post helper when a File is present in data
        post(route('announcements.store'), {
            forceFormData: true,
            onSuccess: () => {
                // Redirect will be handled by Laravel Redirect response
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Link
                        href={route('announcements.index')}
                        className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                            Buat & Siarkan Pengumuman Baru
                        </h2>
                        <p className="text-sm text-slate-500">
                            Publikasikan pesan ke jaringan distributor dan agen secara real-time via WebSocket.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Buat Pengumuman" />

            <div className="py-8 bg-slate-50 min-h-[calc(100vh-6.5rem)]">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    
                    {errors.error && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-semibold">
                            <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                            <span>{errors.error}</span>
                        </div>
                    )}

                    <div className="glass-card rounded-3xl p-8 border border-white/60">
                        <form onSubmit={submit} className="space-y-6 text-xs">
                            
                            {/* JUDUL */}
                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                    <Type className="w-3.5 h-3.5 text-slate-400" />
                                    Judul Pengumuman *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Masukkan judul pengumuman..."
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full text-xs rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                />
                                {errors.title && (
                                    <span className="text-[10px] text-rose-600 mt-1 block">{errors.title}</span>
                                )}
                            </div>

                            {/* TIPE & TARGET */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                                        Kategori Pengumuman *
                                    </label>
                                    <select
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm font-semibold text-slate-700"
                                    >
                                        {types.map((t) => (
                                            <option key={t.value} value={t.value}>
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.type && (
                                        <span className="text-[10px] text-rose-600 mt-1 block">{errors.type}</span>
                                    )}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                                        Target Jaringan *
                                    </label>
                                    <select
                                        value={data.target_role}
                                        onChange={(e) => setData('target_role', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm font-semibold text-slate-700"
                                    >
                                        {targetRoles.map((r) => (
                                            <option key={r.value} value={r.value}>
                                                {r.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.target_role && (
                                        <span className="text-[10px] text-rose-600 mt-1 block">{errors.target_role}</span>
                                    )}
                                </div>
                            </div>

                            {/* EXPIRED DATE & ATTACHMENT */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                        Tanggal Kadaluarsa (Opsional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={data.expires_at}
                                        onChange={(e) => setData('expires_at', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm font-semibold text-slate-700"
                                    />
                                    <span className="text-[10px] text-slate-400 mt-1 block">Biarkan kosong jika berlaku selamanya.</span>
                                    {errors.expires_at && (
                                        <span className="text-[10px] text-rose-600 mt-1 block">{errors.expires_at}</span>
                                    )}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                        <FileUp className="w-3.5 h-3.5 text-slate-400" />
                                        File Lampiran (PDF, JPG, PNG - Maks 10MB)
                                    </label>
                                    <input
                                        type="file"
                                        onChange={(e) => setData('attachment', e.target.files[0])}
                                        className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 text-slate-500 border border-slate-200 rounded-xl"
                                    />
                                    {errors.attachment && (
                                        <span className="text-[10px] text-rose-600 mt-1 block">{errors.attachment}</span>
                                    )}
                                </div>
                            </div>

                            {/* BODY */}
                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">
                                    Isi Pengumuman *
                                </label>
                                <textarea
                                    required
                                    rows="8"
                                    placeholder="Tulis pesan pengumuman di sini..."
                                    value={data.body}
                                    onChange={(e) => setData('body', e.target.value)}
                                    className="w-full text-xs rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm leading-relaxed"
                                />
                                {errors.body && (
                                    <span className="text-[10px] text-rose-600 mt-1 block">{errors.body}</span>
                                )}
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <Link
                                    href={route('announcements.index')}
                                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-center"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-md shadow-indigo-600/10 flex items-center gap-1.5"
                                >
                                    <Send className="w-4 h-4" />
                                    {processing ? 'Menyiarkan...' : 'Siarkan Pengumuman'}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
