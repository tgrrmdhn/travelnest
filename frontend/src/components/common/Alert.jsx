import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

const Alert = ({ type = 'info', title, message, onClose }) => {
  const config = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Info,
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: CheckCircle,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: AlertCircle,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: XCircle,
    },
  };

  const { bg, border, text, icon: Icon } = config[type];

  return (
    <div className={`${bg} ${border} border rounded-lg p-4`}>
      <div className="flex">
        <Icon className={`w-5 h-5 ${text} mt-0.5`} />
        <div className="ml-3 flex-1">
          {title && <h3 className={`text-sm font-medium ${text}`}>{title}</h3>}
          {message && <p className={`text-sm ${text} ${title ? 'mt-1' : ''}`}>{message}</p>}
        </div>
        {onClose && (
          <button onClick={onClose} className={`ml-3 ${text} hover:opacity-70`}>
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;