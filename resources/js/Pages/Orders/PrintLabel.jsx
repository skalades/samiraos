import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import { Printer, Package } from 'lucide-react';

export default function PrintLabel({ order }) {
    
    useEffect(() => {
        // Auto print after a short delay to ensure rendering is complete
        const timer = setTimeout(() => {
            window.print();
        }, 800);
        
        return () => clearTimeout(timer);
    }, []);

    // Format currency
    const formatIDR = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-start justify-center p-4 sm:p-8 font-mono print:bg-white print:p-0 print:m-0">
            <Head title={`Print Label - ${order.order_number}`} />

            {/* Print action bar (hidden in print mode) */}
            <div className="fixed top-4 right-4 print:hidden flex gap-2">
                <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg shadow font-sans text-sm font-bold hover:bg-slate-900"
                >
                    <Printer className="w-4 h-4" /> Cetak Thermal
                </button>
                <button 
                    onClick={() => window.close()}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg shadow-sm font-sans text-sm font-bold hover:bg-slate-50"
                >
                    Tutup
                </button>
            </div>

            {/* Thermal Print Container (80mm width standard is ~302px) */}
            <div className="w-[300px] bg-white text-black p-3 mx-auto text-[11px] leading-snug print:shadow-none print:w-[80mm] print:absolute print:top-0 print:left-0 shadow-xl border border-slate-200 rounded-sm">
                
                {/* Header */}
                <div className="text-center border-b-2 border-black pb-2 mb-2 border-dashed">
                    <h1 className="font-extrabold text-lg uppercase tracking-wider mb-1">SAMI RAOS DMS</h1>
                    <p className="text-[9px] uppercase font-bold">{order.seller?.name}</p>
                    <p className="text-[9px]">Tanggal: {new Date(order.created_at).toLocaleDateString('id-ID')}</p>
                    <p className="text-[9px]">Jam: {new Date(order.created_at).toLocaleTimeString('id-ID')}</p>
                </div>

                {/* Barcode Pseudo Element */}
                <div className="flex flex-col items-center justify-center my-3">
                    <div className="w-[200px] h-[40px] bg-black" style={{ 
                        background: 'repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 5px, #000 5px, #000 8px, #fff 8px, #fff 10px, #000 10px, #000 12px, #fff 12px, #fff 15px)' 
                    }}></div>
                    <span className="font-bold text-xs mt-1 tracking-widest">{order.order_number}</span>
                </div>

                {/* PENGIRIM & PENERIMA */}
                <div className="border-t-2 border-black border-dashed py-2 my-2 space-y-2">
                    <div>
                        <p className="font-bold bg-black text-white px-1 inline-block mb-1">PENGIRIM:</p>
                        <p className="font-bold">{order.seller?.name}</p>
                        <p>{order.seller?.phone}</p>
                    </div>
                    <div>
                        <p className="font-bold bg-black text-white px-1 inline-block mb-1">PENERIMA:</p>
                        <p className="font-extrabold text-sm">{order.buyer?.name}</p>
                        <p>{order.buyer?.phone}</p>
                        <p className="mt-1">{order.buyer?.address || 'Alamat tidak tersedia'}</p>
                        {order.buyer?.territory && (
                            <p className="font-bold mt-1 uppercase">WILAYAH: {order.buyer.territory.name}</p>
                        )}
                    </div>
                </div>

                {/* ITEMS */}
                <div className="border-t-2 border-b-2 border-black border-dashed py-2 my-2">
                    <p className="font-bold mb-1 flex items-center gap-1"><Package className="w-3 h-3"/> RINCIAN BARANG:</p>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-black">
                                <th className="pb-1 font-bold">Item</th>
                                <th className="pb-1 text-center font-bold">Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items?.map((item) => (
                                <tr key={item.id} className="border-b border-gray-300 border-dashed last:border-0">
                                    <td className="py-1.5 pr-2">
                                        <span className="font-bold block">{item.product?.name}</span>
                                        <span className="text-[9px]">SKU: {item.product?.sku}</span>
                                    </td>
                                    <td className="py-1.5 text-center align-top font-bold text-sm">
                                        {item.qty}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* FOOTER */}
                <div className="pt-1">
                    <div className="flex justify-between font-bold text-sm mb-1">
                        <span>TOTAL QTY:</span>
                        <span>{order.items?.reduce((sum, item) => sum + item.qty, 0)} Pcs</span>
                    </div>
                    <div className="flex justify-between font-bold mb-3">
                        <span>PEMBAYARAN:</span>
                        <span className="uppercase">{order.payment_type}</span>
                    </div>
                    
                    <div className="text-center mt-4">
                        <p className="font-bold text-[10px]">TANDA TERIMA</p>
                        <div className="mt-8 border-b border-black w-3/4 mx-auto"></div>
                        <p className="text-[9px] mt-1">(..........................)</p>
                        
                        <p className="text-[9px] mt-4 font-bold">*** TERIMA KASIH ***</p>
                        <p className="text-[8px] mt-1 text-gray-600">Dicetak dari Sami Raos DMS</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
