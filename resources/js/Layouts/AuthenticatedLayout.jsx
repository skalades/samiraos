import { usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Sidebar from '@/Components/Sidebar';
import TopHeader from '@/Components/TopHeader';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const permissions = usePage().props.auth.permissions || {};
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        if (!window.Echo) return;

        const showToast = (announcement) => {
            const id = Date.now() + Math.random().toString(36).substr(2, 9);
            setToasts((prev) => [...prev, { id, ...announcement }]);

            // Play a premium synthetic beep sound using Web Audio API
            try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                
                // Beep 1
                const osc1 = audioCtx.createOscillator();
                const gain1 = audioCtx.createGain();
                osc1.connect(gain1);
                gain1.connect(audioCtx.destination);
                osc1.frequency.value = 523.25; // C5
                gain1.gain.setValueAtTime(0.05, audioCtx.currentTime);
                osc1.start();
                osc1.stop(audioCtx.currentTime + 0.1);

                // Beep 2 (harmony)
                setTimeout(() => {
                    if (audioCtx.state === 'closed') return;
                    const osc2 = audioCtx.createOscillator();
                    const gain2 = audioCtx.createGain();
                    osc2.connect(gain2);
                    gain2.connect(audioCtx.destination);
                    osc2.frequency.value = 659.25; // E5
                    gain2.gain.setValueAtTime(0.05, audioCtx.currentTime);
                    osc2.start();
                    osc2.stop(audioCtx.currentTime + 0.15);
                }, 120);
            } catch (e) {
                // browser blocked audio play, ignore
            }

            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 10000); // 10s timeout
        };

        const activeChannels = [];

        // All users listen to announcements.all
        const allChannel = window.Echo.private('announcements.all')
            .listen('AnnouncementPublished', (e) => {
                showToast(e);
            });
        activeChannels.push({ channel: 'announcements.all', inst: allChannel });

        // Distributor or SuperAdmin listens to announcements.distributor
        if (permissions.view_central_receivables) {
            const distChannel = window.Echo.private('announcements.distributor')
                .listen('AnnouncementPublished', (e) => {
                    showToast(e);
                });
            activeChannels.push({ channel: 'announcements.distributor', inst: distChannel });
        }

        // Agen or SuperAdmin listens to announcements.agen
        if (! permissions.order_with_credit) { // Agen or Superadmin
            const agenChannel = window.Echo.private('announcements.agen')
                .listen('AnnouncementPublished', (e) => {
                    showToast(e);
                });
            activeChannels.push({ channel: 'announcements.agen', inst: agenChannel });
        }

        return () => {
            activeChannels.forEach((ac) => {
                window.Echo.leave(ac.channel);
            });
        };
    }, [user]);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden w-full">
                {/* Topbar */}
                <TopHeader header={header} />

                {/* Main Scrollable Content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>

            {/* TOAST CONTAINER FOR REAL-TIME ANNOUNCEMENTS */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 max-w-sm w-full pointer-events-none">
                {toasts.map((toast) => {
                    const typeStyles = {
                        info: {
                            bg: 'bg-blue-50/95 border-blue-200 shadow-blue-100/50',
                            iconBg: 'bg-blue-600',
                            textColor: 'text-blue-900',
                            emoji: 'ℹ️'
                        },
                        warning: {
                            bg: 'bg-amber-50/95 border-amber-200 shadow-amber-100/50',
                            iconBg: 'bg-amber-500',
                            textColor: 'text-amber-900',
                            emoji: '⚠️'
                        },
                        promo: {
                            bg: 'bg-emerald-50/95 border-emerald-200 shadow-emerald-100/50',
                            iconBg: 'bg-emerald-600',
                            textColor: 'text-emerald-900',
                            emoji: '🎉'
                        },
                        urgent: {
                            bg: 'bg-rose-50/95 border-rose-200 shadow-rose-100/50',
                            iconBg: 'bg-rose-600',
                            textColor: 'text-rose-900',
                            emoji: '🚨'
                        }
                    }[toast.type] || {
                        bg: 'bg-slate-50/95 border-slate-200',
                        iconBg: 'bg-slate-600',
                        textColor: 'text-slate-900',
                        emoji: '📢'
                    };

                    return (
                        <div
                            key={toast.id}
                            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-slide-in ${typeStyles.bg}`}
                        >
                            {/* Icon Indicator */}
                            <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-base shadow-sm ${typeStyles.iconBg}`}>
                                {typeStyles.emoji}
                            </div>
                            
                            {/* Text Body */}
                            <div className="flex-1 min-w-0">
                                <h5 className={`font-extrabold text-xs leading-snug mb-0.5 ${typeStyles.textColor}`}>
                                    {toast.title}
                                </h5>
                                <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">
                                    {toast.body}
                                </p>

                                {/* Render Lampiran jika ada */}
                                {toast.attachment && toast.attachment.match(/\.(jpeg|jpg|gif|png)$/i) && (
                                    <div className="mt-2 mb-1">
                                        <img 
                                            src={`/storage/${toast.attachment}`} 
                                            alt="Lampiran" 
                                            className="w-full h-auto max-h-32 object-cover rounded-lg border border-slate-200/50 shadow-sm"
                                        />
                                    </div>
                                )}
                                {toast.attachment && toast.attachment.match(/\.pdf$/i) && (
                                    <div className="mt-2">
                                        <a href={`/storage/${toast.attachment}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-indigo-600 hover:bg-slate-50 transition-colors shadow-sm">
                                            📄 Lihat PDF
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Dismiss Button */}
                            <button
                                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                                className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100/80 rounded-lg self-start flex-shrink-0"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
