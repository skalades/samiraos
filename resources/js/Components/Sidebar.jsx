import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    ArrowRightLeft,
    PackageCheck, 
    Package, 
    Map, 
    Megaphone, 
    History, 
    Landmark, 
    ShieldAlert, 
    HelpCircle, 
    LogOut 
} from 'lucide-react';

export default function Sidebar() {
    const { auth } = usePage().props;
    const permissions = auth.permissions || {};
    const currentRoute = route().current();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, route: 'dashboard', active: currentRoute === 'dashboard', show: true },
        { name: 'Transaksi', icon: ArrowRightLeft, route: 'orders.index', active: currentRoute?.startsWith('orders.') || currentRoute?.startsWith('receivables.'), show: true },
        { name: 'Stock Opname', icon: PackageCheck, route: 'stock-opnames.index', active: currentRoute?.startsWith('stock-opnames.'), show: permissions.view_central_receivables },
        { name: 'Master Produk', icon: Package, route: 'products.index', active: currentRoute?.startsWith('products.'), show: permissions.manage_products },
        { name: 'Wilayah', icon: Map, route: 'territories.index', active: currentRoute?.startsWith('territories.'), show: permissions.view_all_data },
        { name: 'Pengumuman', icon: Megaphone, route: 'announcements.index', active: currentRoute?.startsWith('announcements.'), show: permissions.manage_announcements },
        { name: 'Log Aktivitas', icon: History, route: 'activity-logs.index', active: currentRoute?.startsWith('activity-logs.'), show: permissions.view_all_data },
        { name: 'Rekening Bank', icon: Landmark, route: 'bank-accounts.index', active: currentRoute?.startsWith('bank-accounts.'), show: permissions.manage_bank_accounts },
        { name: 'Admin Pusat', icon: ShieldAlert, route: null, active: false, show: permissions.view_all_data },
        { name: 'Help', icon: HelpCircle, route: null, active: false, show: true },
    ];

    return (
        <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-full font-sans">
            {/* Logo Section */}
            <div className="h-20 flex items-center px-6 border-b border-slate-100">
                <Link href="/" className="flex items-center gap-3">
                    <img src="/logo.png" alt="Sami Raos Logo" className="h-10 w-auto" />
                    <div className="flex flex-col">
                        <span className="font-extrabold text-sm text-red-700 leading-tight">Sami Raos DMS</span>
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Super Admin Panel</span>
                    </div>
                </Link>
            </div>

            {/* Broadcast Button */}
            {permissions.manage_announcements && (
                <div className="p-4">
                    <Link 
                        href={route('announcements.create')}
                        className="flex items-center justify-center gap-2 w-full bg-[#A31621] hover:bg-red-800 text-white py-2.5 rounded-xl text-sm font-bold shadow-md shadow-red-900/20 transition-all active:scale-[0.98]"
                    >
                        <Megaphone className="w-4 h-4" />
                        New Broadcast
                    </Link>
                </div>
            )}

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1 custom-scrollbar">
                {menuItems.map((item, index) => {
                    if (!item.show) return null;
                    
                    const Icon = item.icon;
                    const isActive = item.active;

                    // Support for items without routes yet
                    const linkProps = item.route 
                        ? { href: route(item.route) } 
                        : { href: '#', onClick: (e) => e.preventDefault() };

                    return (
                        <Link
                            key={index}
                            {...linkProps}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                isActive 
                                    ? 'bg-[#A31621] text-white shadow-md shadow-red-900/10' 
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-slate-100">
                <Link 
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition-all"
                >
                    <LogOut className="w-5 h-5 text-slate-400" />
                    Logout
                </Link>
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #94a3b8; }
            `}</style>
        </aside>
    );
}
