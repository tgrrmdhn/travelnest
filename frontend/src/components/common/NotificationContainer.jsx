import React from 'react';
import { CheckCircle, XCircle, Info, AlertCircle, X } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  const config = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-600',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: XCircle,
      iconColor: 'text-red-600',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Info,
      iconColor: 'text-blue-600',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: AlertCircle,
      iconColor: 'text-yellow-600',
    },
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => {
        const { bg, border, text, icon: Icon, iconColor } = config[notification.type] || config.info;
        
        return (
          <div
            key={notification.id}
            className={`${bg} ${border} border rounded-lg p-4 shadow-lg animate-slide-in-right`}
          >
            <div className="flex items-start gap-3">
              <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
              <p className={`text-sm ${text} flex-1`}>{notification.message}</p>
              <button
                onClick={() => removeNotification(notification.id)}
                className={`${text} hover:opacity-70 transition-opacity`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationContainer;
