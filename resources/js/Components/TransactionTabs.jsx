import { Link, usePage } from '@inertiajs/react';
import { ShoppingBag, Wallet } from 'lucide-react';

export default function TransactionTabs() {
    const { auth } = usePage().props;
    const permissions = auth.permissions || {};
    const currentRoute = route().current();

    const tabs = [
        {
            name: 'Pesanan (Orders)',
            route: 'orders.index',
            icon: ShoppingBag,
            active: currentRoute?.startsWith('orders.'),
            show: true,
        },
        {
            name: 'Piutang (Receivables)',
            route: 'receivables.index',
            icon: Wallet,
            active: currentRoute?.startsWith('receivables.'),
            show: permissions.view_central_receivables,
        }
    ];

    return (
        <div className="flex items-center gap-4 border-b border-slate-200 mb-6">
            {tabs.map((tab, idx) => {
                if (!tab.show) return null;
                const Icon = tab.icon;

                return (
                    <Link
                        key={idx}
                        href={route(tab.route)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
                            tab.active
                                ? 'border-[#A31621] text-[#A31621]'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                    >
                        <Icon className="w-4 h-4" />
                        {tab.name}
                    </Link>
                );
            })}
        </div>
    );
}
