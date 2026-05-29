import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { CreditCard, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import Modal from '@/Components/Modal';

export default function BankAccountsIndex({ accounts }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        bank_name: '',
        account_number: '',
        account_holder: '',
        is_active: true,
    });

    const openCreateModal = () => {
        reset();
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        reset();
        clearErrors();
    };

    const openEditModal = (account) => {
        setEditingAccount(account);
        setData({
            bank_name: account.bank_name,
            account_number: account.account_number,
            account_holder: account.account_holder,
            is_active: account.is_active,
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingAccount(null);
        reset();
        clearErrors();
    };

    const submitCreate = (e) => {
        e.preventDefault();
        post(route('bank-accounts.store'), {
            onSuccess: () => closeCreateModal(),
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        put(route('bank-accounts.update', editingAccount.id), {
            onSuccess: () => closeEditModal(),
        });
    };

    const handleDelete = (id, bankName) => {
        if (confirm(`Hapus rekening ${bankName}?`)) {
            router.delete(route('bank-accounts.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold leading-tight text-gray-800 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-indigo-600" />
                        Rekening Bank Tujuan
                    </h2>
                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4" /> Tambah Rekening
                    </button>
                </div>
            }
        >
            <Head title="Manajemen Rekening Bank" />

            <div className="py-12 bg-slate-50 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl p-6 border border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {accounts.length > 0 ? (
                                accounts.map((account) => (
                                    <div key={account.id} className={`p-5 rounded-2xl border ${account.is_active ? 'border-indigo-100 bg-indigo-50/30' : 'border-slate-200 bg-slate-50'} relative`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{account.bank_name}</div>
                                                <div className="text-lg font-extrabold text-slate-800 tracking-tight">{account.account_number}</div>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${account.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                                {account.is_active ? 'Aktif' : 'Non-aktif'}
                                            </span>
                                        </div>
                                        <div className="text-sm font-semibold text-slate-600 mb-6">
                                            a.n. {account.account_holder}
                                        </div>
                                        <div className="flex items-center gap-2 border-t border-slate-200/60 pt-4">
                                            <button
                                                onClick={() => openEditModal(account)}
                                                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg transition flex items-center gap-1 w-full justify-center"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(account.id, account.bank_name)}
                                                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-rose-50 text-rose-600 text-xs font-bold rounded-lg transition flex items-center gap-1 w-full justify-center"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Hapus
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center text-slate-400">
                                    Belum ada rekening bank yang didaftarkan.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Create */}
            <Modal show={isCreateModalOpen} onClose={closeCreateModal} maxWidth="md">
                <form onSubmit={submitCreate} className="p-6">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-lg font-bold text-slate-800">Tambah Rekening Baru</h2>
                        <button type="button" onClick={closeCreateModal} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Bank</label>
                            <input
                                type="text"
                                value={data.bank_name}
                                onChange={e => setData('bank_name', e.target.value)}
                                className="w-full rounded-xl border-slate-200 text-sm focus:ring-indigo-500"
                                placeholder="Contoh: BCA"
                            />
                            {errors.bank_name && <div className="text-rose-500 text-xs mt-1">{errors.bank_name}</div>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Rekening</label>
                            <input
                                type="text"
                                value={data.account_number}
                                onChange={e => setData('account_number', e.target.value)}
                                className="w-full rounded-xl border-slate-200 text-sm focus:ring-indigo-500"
                                placeholder="Contoh: 1234567890"
                            />
                            {errors.account_number && <div className="text-rose-500 text-xs mt-1">{errors.account_number}</div>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Atas Nama (Pemilik)</label>
                            <input
                                type="text"
                                value={data.account_holder}
                                onChange={e => setData('account_holder', e.target.value)}
                                className="w-full rounded-xl border-slate-200 text-sm focus:ring-indigo-500"
                                placeholder="Contoh: PT Sami Raos"
                            />
                            {errors.account_holder && <div className="text-rose-500 text-xs mt-1">{errors.account_holder}</div>}
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active_create"
                                checked={data.is_active}
                                onChange={e => setData('is_active', e.target.checked)}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="is_active_create" className="text-sm text-slate-700">Aktif digunakan</label>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={closeCreateModal} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold transition">Batal</button>
                        <button type="submit" disabled={processing} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50">
                            {processing ? 'Menyimpan...' : 'Simpan Rekening'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Edit */}
            <Modal show={isEditModalOpen} onClose={closeEditModal} maxWidth="md">
                <form onSubmit={submitEdit} className="p-6">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-lg font-bold text-slate-800">Edit Rekening</h2>
                        <button type="button" onClick={closeEditModal} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Bank</label>
                            <input
                                type="text"
                                value={data.bank_name}
                                onChange={e => setData('bank_name', e.target.value)}
                                className="w-full rounded-xl border-slate-200 text-sm focus:ring-indigo-500"
                            />
                            {errors.bank_name && <div className="text-rose-500 text-xs mt-1">{errors.bank_name}</div>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Rekening</label>
                            <input
                                type="text"
                                value={data.account_number}
                                onChange={e => setData('account_number', e.target.value)}
                                className="w-full rounded-xl border-slate-200 text-sm focus:ring-indigo-500"
                            />
                            {errors.account_number && <div className="text-rose-500 text-xs mt-1">{errors.account_number}</div>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Atas Nama (Pemilik)</label>
                            <input
                                type="text"
                                value={data.account_holder}
                                onChange={e => setData('account_holder', e.target.value)}
                                className="w-full rounded-xl border-slate-200 text-sm focus:ring-indigo-500"
                            />
                            {errors.account_holder && <div className="text-rose-500 text-xs mt-1">{errors.account_holder}</div>}
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active_edit"
                                checked={data.is_active}
                                onChange={e => setData('is_active', e.target.checked)}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="is_active_edit" className="text-sm text-slate-700">Aktif digunakan</label>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={closeEditModal} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold transition">Batal</button>
                        <button type="submit" disabled={processing} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50">
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
