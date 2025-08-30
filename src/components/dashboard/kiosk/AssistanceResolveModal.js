import React, { useState } from 'react';
import { CheckCircle, X, AlertTriangle, Clock } from 'lucide-react';

const AssistanceResolveModal = ({ 
  request, 
  onResolve, 
  onAcknowledge, 
  onCancel,
  isVisible 
}) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isVisible || !request) return null;

  const handleResolve = async () => {
    if (!notes.trim()) {
      alert('Please provide notes on how the issue was resolved.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onResolve(request.id, notes.trim());
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcknowledge = async () => {
    setIsSubmitting(true);
    try {
      await onAcknowledge(request.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusInfo = () => {
    switch (request.status) {
      case 'pending':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200'
        };
      case 'acknowledged':
        return {
          icon: <Clock className="w-5 h-5 text-yellow-500" />,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 border-yellow-200'
        };
      default:
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {statusInfo.icon}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Table {request.table_number} - Assistance Request
                </h2>
                <p className={`text-sm font-medium capitalize ${statusInfo.color}`}>
                  {request.status}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Request Details */}
          <div className={`p-4 rounded-lg border ${statusInfo.bgColor}`}>
            <h3 className="font-medium text-gray-900 mb-2">Request Message:</h3>
            <p className="text-gray-700">{request.message}</p>
            <div className="mt-3 space-y-1 text-xs text-gray-500">
              <p>Created: {new Date(request.created_at).toLocaleString()}</p>
              {request.acknowledged_at && (
                <p>Acknowledged: {new Date(request.acknowledged_at).toLocaleString()}</p>
              )}
              {request.resolved_at && (
                <p>Resolved: {new Date(request.resolved_at).toLocaleString()}</p>
              )}
              {request.notes && (
                <div className="mt-2 p-2 bg-gray-50 rounded border">
                  <p className="font-medium text-gray-700">Resolution Notes:</p>
                  <p className="text-gray-600 mt-1">{request.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Resolution Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Resolution Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Please describe how the issue was resolved or what assistance was provided..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              These notes will be saved for record keeping and training purposes.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t space-y-3">
          {/* Resolve Button - Primary Action */}
          <button
            onClick={handleResolve}
            disabled={isSubmitting || !notes.trim()}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-green-500 ${
              !notes.trim() || isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Resolving...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Mark as Resolved
              </div>
            )}
          </button>

          {/* Secondary Actions */}
          <div className="flex gap-3">
            {request.status === 'pending' && (
              <button
                onClick={handleAcknowledge}
                disabled={isSubmitting}
                className="flex-1 py-2 px-4 border border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : 'Acknowledge Only'}
              </button>
            )}
            
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistanceResolveModal;