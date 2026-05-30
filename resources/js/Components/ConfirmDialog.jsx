import { X, AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ 
    isOpen, 
    title = 'Konfirmasi Tindakan', 
    message, 
    onConfirm, 
    onCancel, 
    confirmText = 'Konfirmasi',
    cancelText = 'Batal',
    danger = false 
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                    <div className="flex gap-3 items-start">
                        <div className={`p-2 rounded-full shrink-0 ${danger ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-slate-800 text-base">{title}</h3>
                            <p className="text-sm text-slate-500 mt-1 leading-relaxed">{message}</p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 transition-colors shrink-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 flex gap-2 justify-end bg-white">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onConfirm();
                            onCancel();
                        }}
                        className={`px-5 py-2.5 font-semibold text-xs rounded-xl transition-colors text-white ${
                            danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/10'
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
