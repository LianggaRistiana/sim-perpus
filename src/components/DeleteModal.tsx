import React from 'react';
import { Trash2 } from 'lucide-react';
import { Modal } from './Modal';

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Hapus Item?',
    message = 'Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan.',
    confirmLabel = 'Ya, Hapus',
    cancelLabel = 'Batal',
    loading = false
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            width="max-w-sm"
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-red-600/20 hover:bg-red-700 hover:shadow-xl hover:shadow-red-600/10 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Menghapus...' : confirmLabel}
                    </button>
                </>
            }
        >
            <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <Trash2 size={24} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-neutral-900">{title}</h3>
                <p className="text-sm text-neutral-500">
                    {message}
                </p>
            </div>
        </Modal>
    );
};
