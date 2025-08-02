import React from 'react';
import { X, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'success' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: XCircle,
          iconColor: 'text-red-600',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
        };
      case 'success':
        return {
          icon: CheckCircle,
          iconColor: 'text-green-600',
          confirmButton: 'bg-green-600 hover:bg-green-700 text-white',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-yellow-600',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        };
      default:
        return {
          icon: Info,
          iconColor: 'text-blue-600',
          confirmButton: 'bg-primary-600 hover:bg-primary-700 text-white',
        };
    }
  };

  const { icon: IconComponent, iconColor, confirmButton } = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Dialog */}
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full bg-gray-100`}>
                <IconComponent className={`h-6 w-6 ${iconColor}`} />
              </div>
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Message */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">{message}</p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${confirmButton}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
