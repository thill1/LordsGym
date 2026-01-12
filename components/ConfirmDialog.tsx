import React from 'react';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: 'border-red-500',
    warning: 'border-amber-500',
    info: 'border-blue-500'
  };

  const buttonVariants = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-amber-600 hover:bg-amber-700',
    info: 'bg-blue-600 hover:bg-blue-700'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`bg-white dark:bg-neutral-800 rounded-lg shadow-2xl w-full max-w-md border-t-4 ${variantStyles[variant]}`}>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4 dark:text-white">{title}</h3>
          <p className="text-neutral-700 dark:text-neutral-300 mb-6">{message}</p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onCancel}
            >
              {cancelText}
            </Button>
            <Button
              variant="brand"
              onClick={onConfirm}
              className={buttonVariants[variant]}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
