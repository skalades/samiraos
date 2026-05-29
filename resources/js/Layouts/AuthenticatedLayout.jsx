import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

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
        if (user.role === 'distributor' || user.role === 'super_admin') {
            const distChannel = window.Echo.private('announcements.distributor')
                .listen('AnnouncementPublished', (e) => {
                    showToast(e);
                });
            activeChannels.push({ channel: 'announcements.distributor', inst: distChannel });
        }

        // Agen or SuperAdmin listens to announcements.agen
        if (user.role === 'agen' || user.role === 'super_admin') {
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
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>
                                
                                <NavLink
                                    href={route('orders.index')}
                                    active={route().current('orders.*')}
                                >
                                    Orders
                                </NavLink>

                                {(user.role === 'super_admin' || user.role === 'distributor') && (
                                    <NavLink
                                        href={route('receivables.index')}
                                        active={route().current('receivables.*')}
                                    >
                                        Piutang
                                    </NavLink>
                                )}

                                {(user.role === 'super_admin' || user.role === 'distributor') && (
                                    <NavLink
                                        href={route('stock-opnames.index')}
                                        active={route().current('stock-opnames.*')}
                                    >
                                        Stock Opname
                                    </NavLink>
                                )}

                                {user.role === 'super_admin' && (
                                    <NavLink
                                        href={route('products.index')}
                                        active={route().current('products.*')}
                                    >
                                        Master Produk
                                    </NavLink>
                                )}

                                {user.role === 'super_admin' && (
                                    <NavLink
                                        href={route('territories.index')}
                                        active={route().current('territories.*')}
                                    >
                                        Wilayah
                                    </NavLink>
                                )}

                                {user.role === 'super_admin' && (
                                    <NavLink
                                        href={route('announcements.index')}
                                        active={route().current('announcements.*')}
                                    >
                                        Pengumuman
                                    </NavLink>
                                )}

                                {user.role === 'super_admin' && (
                                    <NavLink
                                        href={route('activity-logs.index')}
                                        active={route().current('activity-logs.*')}
                                    >
                                        Log Aktivitas
                                    </NavLink>
                                )}

                                {user.role === 'super_admin' && (
                                    <NavLink
                                        href={route('bank-accounts.index')}
                                        active={route().current('bank-accounts.*')}
                                    >
                                        Rekening Bank
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        
                        <ResponsiveNavLink
                            href={route('orders.index')}
                            active={route().current('orders.*')}
                        >
                            Orders
                        </ResponsiveNavLink>

                        {(user.role === 'super_admin' || user.role === 'distributor') && (
                            <ResponsiveNavLink
                                href={route('receivables.index')}
                                active={route().current('receivables.*')}
                            >
                                Piutang
                            </ResponsiveNavLink>
                        )}

                        {(user.role === 'super_admin' || user.role === 'distributor') && (
                            <ResponsiveNavLink
                                href={route('stock-opnames.index')}
                                active={route().current('stock-opnames.*')}
                            >
                                Stock Opname
                            </ResponsiveNavLink>
                        )}

                        {user.role === 'super_admin' && (
                            <>
                                <ResponsiveNavLink
                                    href={route('products.index')}
                                    active={route().current('products.*')}
                                >
                                    Master Produk
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('territories.index')}
                                    active={route().current('territories.*')}
                                >
                                    Wilayah
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('announcements.index')}
                                    active={route().current('announcements.*')}
                                >
                                    Pengumuman
                                </ResponsiveNavLink>
                            </>
                        )}

                        {user.role === 'super_admin' && (
                            <>
                                <ResponsiveNavLink
                                    href={route('activity-logs.index')}
                                    active={route().current('activity-logs.*')}
                                >
                                    Log Aktivitas
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('bank-accounts.index')}
                                    active={route().current('bank-accounts.*')}
                                >
                                    Rekening Bank
                                </ResponsiveNavLink>
                            </>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>

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
