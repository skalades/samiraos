import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { 
    MapPin, 
    Edit, 
    Save, 
    X,
    TrendingUp,
    ShieldAlert
} from 'lucide-react';
import L from 'leaflet';

export default function TerritoriesIndex({ territories }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const [selectedTerritory, setSelectedTerritory] = useState(null);

    const { data, setData, put, processing, errors, reset } = useForm({
        name: '',
        latitude: '',
        longitude: '',
        max_stock_capacity: ''
    });

    useEffect(() => {
        if (!mapRef.current) return;

        // Initialize Map
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

        // Clear existing markers
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        // Add markers
        territories.forEach((t) => {
            if (!t.latitude || !t.longitude) return;

            const marker = L.marker([t.latitude, t.longitude], {
                icon: L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div class="w-4 h-4 rounded-full border-2 border-white shadow-md bg-indigo-600"></div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                })
            }).addTo(map);

            marker.bindTooltip(`<strong>${t.name} Regional</strong><br>Kapasitas: ${t.max_stock_capacity} pcs`, {
                direction: 'top'
            });

            marker.on('click', () => {
                handleOpenEditModal(t);
                map.setView([t.latitude, t.longitude], 10);
            });
        });
    }, [territories]);

    const handleOpenEditModal = (territory) => {
        setSelectedTerritory(territory);
        setData({
            name: territory.name,
            latitude: territory.latitude ? territory.latitude.toString() : '',
            longitude: territory.longitude ? territory.longitude.toString() : '',
            max_stock_capacity: territory.max_stock_capacity.toString()
        });
    };

    const handleCloseEditModal = () => {
        setSelectedTerritory(null);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('territories.update', selectedTerritory.id), {
            onSuccess: () => {
                handleCloseEditModal();
                alert('Informasi wilayah berhasil diperbarui!');
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                        Kelola Wilayah & Kapasitas Stok
                    </h2>
                    <p className="text-sm text-slate-500">
                        Atur koordinat geografis wilayah dan batas kapasitas gudang distributor regional.
                    </p>
                </div>
            }
        >
            <Head title="Jaringan Wilayah" />

            <div className="py-8 bg-slate-50 min-h-[calc(100vh-6.5rem)]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">

                    {/* TOP MAP BLOCK */}
                    <div className="glass-card rounded-3xl p-6 space-y-4">
                        <h3 className="text-base font-bold text-slate-800">Visualisasi Geografis Wilayah Jaringan</h3>
                        <div className="map-container relative">
                            <div ref={mapRef} className="w-full h-full z-0" />
                        </div>
                    </div>

                    {/* TERRITORIES TABLE LIST */}
                    <div className="glass-card rounded-3xl p-6 overflow-hidden">
                        <h3 className="text-base font-bold text-slate-800 border-b pb-3 mb-4">Daftar 17 Wilayah Regional</h3>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b text-slate-400 font-bold">
                                        <th className="py-3">Nama Wilayah</th>
                                        <th className="py-3">Distributor Penanggung Jawab</th>
                                        <th className="py-3">No. Kontak</th>
                                        <th className="py-3 text-right">Kapasitas Maksimal</th>
                                        <th className="py-3">Koordinat Lat / Long</th>
                                        <th className="py-3 text-center">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-slate-700">
                                    {territories.map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-50/20">
                                            <td className="py-4 font-bold text-slate-800 flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-indigo-500" />
                                                {t.name}
                                            </td>
                                            <td className="py-4 font-semibold text-slate-700">{t.distributor?.name || '-'}</td>
                                            <td className="py-4 text-slate-500">{t.distributor?.phone || '-'}</td>
                                            <td className="py-4 text-right font-bold text-slate-800">
                                                {t.max_stock_capacity.toLocaleString('id-ID')} pcs
                                            </td>
                                            <td className="py-4 text-slate-400">
                                                {t.latitude && t.longitude ? `${t.latitude}, ${t.longitude}` : 'Belum Diatur'}
                                            </td>
                                            <td className="py-4 text-center">
                                                <button
                                                    onClick={() => handleOpenEditModal(t)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-lg border border-indigo-100 transition-colors mx-auto"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                    Edit Wilayah
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            {/* EDIT TERRITORY MODAL */}
            {selectedTerritory && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden border border-slate-100">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-extrabold text-slate-800 text-base">Edit Wilayah: {selectedTerritory.name}</h3>
                                <p className="text-xs text-slate-500">Konfigurasi kapasitas regional dan koordinat</p>
                            </div>
                            <button
                                onClick={handleCloseEditModal}
                                className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submit} className="p-6 space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-600 mb-1">Nama Wilayah *</label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full text-xs rounded-xl border-slate-200 focus:ring-indigo-500"
                                />
                                {errors.name && <span className="text-[10px] text-rose-600 mt-1 block">{errors.name}</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-600 mb-1">Latitude</label>
                                    <input
                                        type="text"
                                        value={data.latitude}
                                        onChange={(e) => setData('latitude', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-200 focus:ring-indigo-500"
                                        placeholder="e.g. -7.2167"
                                    />
                                    {errors.latitude && <span className="text-[10px] text-rose-600 mt-1 block">{errors.latitude}</span>}
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-600 mb-1">Longitude</label>
                                    <input
                                        type="text"
                                        value={data.longitude}
                                        onChange={(e) => setData('longitude', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-200 focus:ring-indigo-500"
                                        placeholder="e.g. 107.9083"
                                    />
                                    {errors.longitude && <span className="text-[10px] text-rose-600 mt-1 block">{errors.longitude}</span>}
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-600 mb-1">Kapasitas Maksimal Gudang (pcs) *</label>
                                <input
                                    type="number"
                                    required
                                    value={data.max_stock_capacity}
                                    onChange={(e) => setData('max_stock_capacity', e.target.value)}
                                    className="w-full text-xs rounded-xl border-slate-200 focus:ring-indigo-500 font-bold"
                                    min="100"
                                />
                                {errors.max_stock_capacity && <span className="text-[10px] text-rose-600 mt-1 block">{errors.max_stock_capacity}</span>}
                            </div>

                            <div className="flex gap-2 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={handleCloseEditModal}
                                    className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-center"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-center shadow-md shadow-indigo-600/10"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
