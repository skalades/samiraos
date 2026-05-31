import { Bell, Settings, User, Menu } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';

export default function TopHeader({ header, toggleSidebar }) {
    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
            {/* Left side: Page Title (from header prop) */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <button 
                    onClick={toggleSidebar} 
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                    {header}
                </div>
            </div>

            {/* Right side: Tools & Profile */}
            <div className="flex items-center gap-6 ml-6">
                {/* Icons */}
                <div className="flex items-center gap-3">
                    <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>

                {/* Vertical Divider */}
                <div className="w-px h-8 bg-slate-200"></div>

                {/* Profile Dropdown */}
                <div className="relative">
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button className="flex items-center gap-3 focus:outline-none group">
                                <div className="flex flex-col items-end">
                                    <span className="text-sm font-bold text-slate-800 group-hover:text-red-700 transition-colors">
                                        {user.name}
                                    </span>
                                    <span className="text-[10px] text-slate-500 uppercase font-semibold">
                                        Super Admin
                                    </span>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                                    {/* Placeholder Avatar, could use image from design if present */}
                                    <User className="w-5 h-5 text-slate-400" />
                                </div>
                            </button>
                        </Dropdown.Trigger>

                        <Dropdown.Content align="right" width="48">
                            <Dropdown.Link href={route('profile.edit')}>
                                Profile Settings
                            </Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button">
                                Log Out
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </div>
        </header>
    );
}
