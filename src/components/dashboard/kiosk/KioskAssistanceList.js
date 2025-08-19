import React from 'react';
import { HandHeart, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const KioskAssistanceList = ({ assistanceRequests, onAssistanceAction }) => {
  if (!assistanceRequests || assistanceRequests.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <HandHeart className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No assistance requests</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'acknowledged':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'resolved':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <AlertTriangle className="w-4 h-4" />;
      case 'acknowledged':
        return <Clock className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <HandHeart className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-2">
      <div className="px-4 py-2 bg-orange-50 border-b border-orange-200">
        <div className="flex items-center gap-2">
          <HandHeart className="w-4 h-4 text-orange-600" />
          <h3 className="font-medium text-orange-800">Assistance Requests</h3>
          <span className="text-xs bg-orange-200 text-orange-700 px-2 py-1 rounded-full">
            {assistanceRequests.length}
          </span>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-2 px-2">
        {assistanceRequests.map((request) => (
          <div
            key={request.id}
            className={`border rounded-lg p-3 ${getStatusColor(request.status)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(request.status)}
                <span className="font-semibold">Table {request.table_number}</span>
              </div>
              <span className="text-xs opacity-75">
                {dayjs(request.created_at).fromNow()}
              </span>
            </div>

            <p className="text-sm mb-3">{request.message}</p>

            <div className="flex gap-2">
              {request.status === 'pending' && (
                <button
                  onClick={() => onAssistanceAction(request.id, 'acknowledge')}
                  className="flex-1 bg-white text-yellow-700 border border-yellow-300 px-3 py-1 rounded text-sm font-medium hover:bg-yellow-50 transition-colors"
                >
                  Acknowledge
                </button>
              )}
              
              {(request.status === 'pending' || request.status === 'acknowledged') && (
                <button
                  onClick={() => onAssistanceAction(request.id, 'resolve')}
                  className="flex-1 bg-white text-green-700 border border-green-300 px-3 py-1 rounded text-sm font-medium hover:bg-green-50 transition-colors"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KioskAssistanceList;