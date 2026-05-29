import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { 
    Users, 
    Package, 
    TrendingUp, 
    AlertTriangle, 
    FileText, 
    Bell, 
    MapPin, 
    DollarSign,
    ShieldAlert,
    Calendar,
    Activity
} from 'lucide-react';
import L from 'leaflet';

export default function SuperAdminDashboard({ stats, territories, recentAnnouncements, recentLogs }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const [selectedTerritory, setSelectedTerritory] = useState(null);

    // Format currency to IDR
    const formatIDR = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    useEffect(() => {
        if (!mapRef.current) return;

        // Initialize Leaflet Map centered around West/Central Java
        if (!mapInstance.current) {
            mapInstance.current = L.map(mapRef.current, {
                center: [-6.9175, 108.3],
                zoom: 8,
                zoomControl: true,
                layers: [
                    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                        subdomains: 'abcd',
                        maxZoom: 20
                    })
                ]
            });
        }

        const map = mapInstance.current;

        // Clear existing markers/layers (except tiles)
        map.eachLayer((layer) => {
            if (layer instanceof L.Circle || layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        // Add markers for each territory
        territories.forEach((t) => {
            if (!t.latitude || !t.longitude) return;

            // Determine color based on stock status
            const colorMap = {
                aman: '#10b981',    // Emerald Green
                low: '#f59e0b',     // Amber Orange
                kritis: '#ef4444'   // Rose Red
            };
            const color = colorMap[t.stock_status] || '#64748b';

            // Create circular zone representation
            const circle = L.circle([t.latitude, t.longitude], {
                color: color,
                fillColor: color,
                fillOpacity: 0.45,
                radius: 12000, // 12km radius for visibility
                weight: 2
            }).addTo(map);

            // Create standard interactive marker for details
            const marker = L.marker([t.latitude, t.longitude], {
                icon: L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div class="w-4 h-4 rounded-full border-2 border-white shadow-md" style="background-color: ${color}"></div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                })
            }).addTo(map);

            const popupContent = `
                <div class="p-2 font-sans min-w-[200px]">
                    <h4 class="font-bold text-sm text-slate-800 border-b pb-1 mb-1">${t.name} Regional</h4>
                    <p class="text-xs text-slate-600 mb-1"><strong>Distributor:</strong> ${t.distributor_name}</p>
                    <div class="mt-2">
                        <div class="flex justify-between text-xs font-semibold mb-1">
                            <span>Kapasitas Stok</span>
                            <span>${t.stock_percentage}%</span>
                        </div>
                        <div class="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div class="h-full rounded-full" style="width: ${Math.min(t.stock_percentage, 100)}%; background-color: ${color}"></div>
                        </div>
                        <p class="text-[10px] text-slate-500 mt-1">${t.total_stock.toLocaleString('id-ID')} / ${t.max_stock_capacity.toLocaleString('id-ID')} pcs</p>
                    </div>
                </div>
            `;

            // Click listener
            const handleClick = () => {
                setSelectedTerritory(t);
                map.setView([t.latitude, t.longitude], 10);
            };

            circle.on('click', handleClick);
            marker.on('click', handleClick);

            circle.bindTooltip(`<strong>${t.name}</strong>: ${t.stock_percentage}% Stok`, {
                permanent: false,
                direction: 'top'
            });
            marker.bindPopup(popupContent);
        });

        return () => {
            // cleanup if needed
        };
    }, [territories]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                            Dashboard Super Admin
                        </h2>
                        <p className="text-sm text-slate-500">
                            Distributor Management System (DMS) Sami Raos Pusat
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Koneksi Pusat Aktif
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Super Admin Dashboard" />

            <div className="py-8 bg-slate-50 min-h-[calc(100vh-6.5rem)]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
                    
                    {/* STATS ROW */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        
                        {/* Distributors */}
                        <div className="glass-card rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-between">
                            <div className="space-y-2">
                                <span className="text-sm font-semibold text-slate-500">Distributor Aktif</span>
                                <div className="text-3xl font-extrabold text-slate-800">{stats.totalDistributors}</div>
                                <span className="text-xs text-slate-400">Tersebar di 17 wilayah</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
                                <MapPin className="w-6 h-6" />
                            </div>
                        </div>

                        {/* Agents */}
                        <div className="glass-card rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-between">
                            <div className="space-y-2">
                                <span className="text-sm font-semibold text-slate-500">Total Agen</span>
                                <div className="text-3xl font-extrabold text-slate-800">{stats.totalAgents}</div>
                                <span className="text-xs text-slate-400">Terdaftar di bawah distributor</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>

                        {/* Pending Orders Alert */}
                        <Link 
                            href={route('orders.index')} 
                            className="glass-card rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-between group"
                        >
                            <div className="space-y-2">
                                <span className="text-sm font-semibold text-slate-500">PO Pending</span>
                                <div className="flex items-center gap-2">
                                    <div className="text-3xl font-extrabold text-slate-800">{stats.pendingOrders}</div>
                                    {stats.pendingOrders > 0 && (
                                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">
                                            Butuh Verifikasi
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-indigo-600 group-hover:underline font-medium">Lihat daftar pesanan →</span>
                            </div>
                            <div className={`p-4 rounded-2xl ${stats.pendingOrders > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                        </Link>

                        {/* Revenue (Current Month) */}
                        <div className="glass-card rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-between">
                            <div className="space-y-2">
                                <span className="text-sm font-semibold text-slate-500">Omset Bulan Ini</span>
                                <div className="text-2xl font-extrabold text-slate-800 truncate max-w-[180px]">
                                    {formatIDR(stats.totalRevenue)}
                                </div>
                                <span className="text-xs text-slate-400">Dari PO selesai bulan berjalan</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600">
                                <DollarSign className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* PIUTANG ALERT BANNER */}
                    {(stats.totalReceivables > 0 || stats.overdueCount > 0) && (
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-xl bg-red-100 text-red-700">
                                    <ShieldAlert className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">Status Piutang Nasional Butuh Perhatian</h4>
                                    <p className="text-xs text-slate-600 mt-0.5">
                                        Total piutang berjalan saat ini sebesar <strong className="text-red-700">{formatIDR(stats.totalReceivables)}</strong>. 
                                        {stats.overdueCount > 0 && ` Terdapat ${stats.overdueCount} tagihan jatuh tempo (overdue).`}
                                    </p>
                                </div>
                            </div>
                            <Link 
                                href={route('receivables.index')}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors text-center"
                            >
                                Kelola Piutang
                            </Link>
                        </div>
                    )}

                    {/* INTERACTIVE MAP & DETAILS SECTION */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Map Visualizer */}
                        <div className="lg:col-span-2 glass-card rounded-3xl p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Visualisasi Level Stok Regional</h3>
                                    <p className="text-xs text-slate-500">Peta interaktif status kapasitas stok 17 distributor</p>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Aman (&gt;60%)</span>
                                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Rendah (20-60%)</span>
                                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Kritis (&lt;20%)</span>
                                </div>
                            </div>
                            
                            <div className="map-container relative">
                                <div ref={mapRef} className="w-full h-full z-0" />
                            </div>
                        </div>

                        {/* Selected Territory Details */}
                        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 border-b pb-3 mb-4">Informasi Wilayah</h3>
                                
                                {selectedTerritory ? (
                                    <div className="space-y-5">
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nama Wilayah</span>
                                            <h4 className="text-xl font-extrabold text-slate-800 mt-0.5">{selectedTerritory.name}</h4>
                                        </div>

                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Distributor Penanggung Jawab</span>
                                            <p className="text-sm font-semibold text-slate-700 mt-0.5">{selectedTerritory.distributor_name}</p>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs font-semibold text-slate-600">
                                                <span>Status Stok Gudang</span>
                                                <span>{selectedTerritory.stock_percentage}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                                <div 
                                                    className="h-full rounded-full transition-all duration-500" 
                                                    style={{ 
                                                        width: `${Math.min(selectedTerritory.stock_percentage, 100)}%`,
                                                        backgroundColor: selectedTerritory.stock_status === 'aman' ? '#10b981' : selectedTerritory.stock_status === 'low' ? '#f59e0b' : '#ef4444'
                                                    }} 
                                                />
                                            </div>
                                            <div className="flex justify-between text-[10px] text-slate-400">
                                                <span>{selectedTerritory.total_stock.toLocaleString('id-ID')} pcs terisi</span>
                                                <span>Kapasitas: {selectedTerritory.max_stock_capacity.toLocaleString('id-ID')} pcs</span>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                                                style={{
                                                    color: selectedTerritory.stock_status === 'aman' ? '#047857' : selectedTerritory.stock_status === 'low' ? '#b45309' : '#b91c1c',
                                                    backgroundColor: selectedTerritory.stock_status === 'aman' ? '#ecfdf5' : selectedTerritory.stock_status === 'low' ? '#fffbeb' : '#fef2f2',
                                                    borderColor: selectedTerritory.stock_status === 'aman' ? '#a7f3d0' : selectedTerritory.stock_status === 'low' ? '#fde68a' : '#fca5a5'
                                                }}
                                            >
                                                Status: {selectedTerritory.stock_status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center space-y-3">
                                        <MapPin className="w-10 h-10 stroke-1" />
                                        <p className="text-xs">Klik pin wilayah atau lingkaran di peta untuk melihat statistik detail distributor regional.</p>
                                    </div>
                                )}
                            </div>

                            {selectedTerritory && (
                                <div className="mt-6 border-t pt-4">
                                    <Link 
                                        href={route('territories.index')}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-950 text-white rounded-xl text-xs font-semibold transition-colors"
                                    >
                                        Kelola Seluruh Wilayah
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* BOTTOM ROW: ANNOUNCEMENTS & AUDIT FEED */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Announcements Broadcast */}
                        <div className="glass-card rounded-3xl p-6 space-y-4">
                            <div className="flex justify-between items-center border-b pb-3">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-indigo-500" />
                                    Pengumuman Terbaru
                                </h3>
                                <Link 
                                    href={route('announcements.index')}
                                    className="text-xs text-indigo-600 hover:underline font-semibold"
                                >
                                    Buat Baru
                                </Link>
                            </div>

                            <div className="space-y-4 overflow-y-auto max-h-[350px] pr-1">
                                {recentAnnouncements.length > 0 ? (
                                    recentAnnouncements.map((ann) => (
                                        <div key={ann.id} className="border-b pb-3 last:border-0 last:pb-0 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                                                    ${ann.type === 'urgent' ? 'bg-rose-100 text-rose-800' : 
                                                      ann.type === 'warning' ? 'bg-amber-100 text-amber-800' : 
                                                      ann.type === 'promo' ? 'bg-emerald-100 text-emerald-800' : 
                                                      'bg-blue-100 text-blue-800'}`}
                                                >
                                                    {ann.type}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {new Date(ann.published_at || ann.created_at).toLocaleDateString('id-ID')}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-slate-800 text-sm leading-snug">{ann.title}</h4>
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{ann.body}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-slate-400 text-xs">Belum ada pengumuman terbit.</div>
                                )}
                            </div>
                        </div>

                        {/* Audit Trail Log Feed */}
                        <div className="lg:col-span-2 glass-card rounded-3xl p-6 space-y-4">
                            <div className="flex justify-between items-center border-b pb-3">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-indigo-500" />
                                    Audit Trail (Log Aktivitas)
                                </h3>
                                <Link 
                                    href={route('activity-logs.index')}
                                    className="text-xs text-indigo-600 hover:underline font-semibold"
                                >
                                    Selengkapnya
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b text-slate-400 font-bold">
                                            <th className="py-2.5">Waktu</th>
                                            <th className="py-2.5">User</th>
                                            <th className="py-2.5">Aksi</th>
                                            <th className="py-2.5">Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y text-slate-700">
                                        {recentLogs.length > 0 ? (
                                            recentLogs.map((log) => (
                                                <tr key={log.id} className="hover:bg-slate-50/50">
                                                    <td className="py-3 text-slate-400">
                                                        {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="py-3 font-semibold text-slate-800">
                                                        {log.user?.name || 'Sistem'}
                                                    </td>
                                                    <td className="py-3">
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                                            {log.action_type}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 max-w-[250px] truncate" title={log.description}>
                                                        {log.description}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-12 text-slate-400 text-xs">Log aktivitas kosong.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
