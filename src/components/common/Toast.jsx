import { CheckCircle, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] toast-enter">
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl ${
          type === 'success'
            ? 'bg-green-600 text-white'
            : type === 'error'
            ? 'bg-red-600 text-white'
            : 'bg-brand-navy text-white'
        }`}
      >
        {type === 'success' ? (
          <CheckCircle size={20} />
        ) : (
          <AlertCircle size={20} />
        )}
        <span className="font-san text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-70">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
