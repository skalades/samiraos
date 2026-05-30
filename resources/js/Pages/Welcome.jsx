import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Package, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Sami Raos - Distributor Management System" />
            <div className="min-h-screen bg-slate-900 text-slate-50 selection:bg-indigo-500 selection:text-white overflow-hidden relative">
                
                {/* Background effects */}
                <div className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-indigo-600/30 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[40rem] h-[40rem] bg-rose-600/20 blur-[100px] rounded-full pointer-events-none" />
                
                {/* Navigation */}
                <nav className="relative z-10 w-full flex justify-between items-center py-6 px-6 sm:px-12 lg:px-24">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Package className="text-white w-5 h-5" />
                        </div>
                        <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Sami Raos
                        </span>
                    </div>
                    <div>
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="font-semibold text-sm px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/5 backdrop-blur-md transition-all shadow-lg"
                            >
                                Ke Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="font-bold text-sm px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2 group"
                            >
                                Masuk Sistem
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        )}
                    </div>
                </nav>

                {/* Hero Section */}
                <main className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-32 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-indigo-300 mb-8 backdrop-blur-md">
                        <Zap className="w-3.5 h-3.5" />
                        Platform Manajemen Distribusi Modern
                    </div>
                    
                    <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] max-w-4xl">
                        Sistem Pintar untuk <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400">
                            Ekspansi Bisnis Anda
                        </span>
                    </h1>
                    
                    <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mb-12 leading-relaxed">
                        Sami Raos Distributor Management System (DMS) memudahkan monitoring stok, pengelolaan piutang, dan pelacakan pesanan secara real-time dari Pusat hingga tingkat Agen.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        {!auth.user && (
                            <Link
                                href={route('login')}
                                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_0_60px_-10px_rgba(79,70,229,0.6)] flex items-center justify-center gap-2"
                            >
                                Akses Dashboard
                            </Link>
                        )}
                    </div>
                </main>

                {/* Features Grid */}
                <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-32">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition-colors group">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Monitoring Real-time</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Pantau pergerakan stok, omset, dan pencapaian target harian secara langsung dari dashboard terpadu.
                            </p>
                        </div>
                        
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition-colors group">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Manajemen Piutang</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Sistem kontrol limit kredit dan jatuh tempo yang terintegrasi, mengurangi risiko gagal bayar.
                            </p>
                        </div>
                        
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition-colors group">
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Package className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Distribusi Cerdas</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Alur pesanan otomatis dari Agen ke Distributor hingga Pusat dengan notifikasi status yang akurat.
                            </p>
                        </div>
                    </div>
                </section>
                
                {/* Footer */}
                <footer className="relative z-10 border-t border-white/10 text-center py-8">
                    <p className="text-slate-500 text-sm font-medium">
                        &copy; {new Date().getFullYear()} Sami Raos. Hak cipta dilindungi undang-undang.
                    </p>
                </footer>

            </div>
        </>
    );
}
