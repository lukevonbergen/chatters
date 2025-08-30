import React, { useState } from 'react';
import { HandHeart, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import AssistanceResolveModal from './AssistanceResolveModal';

dayjs.extend(relativeTime);

const KioskAssistanceList = ({ assistanceRequests, onAssistanceAction }) => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setSelectedRequest(null);
    setShowModal(false);
  };

  const handleResolveWithNotes = async (requestId, notes) => {
    await onAssistanceAction(requestId, 'resolve', notes);
    handleModalClose();
  };

  const handleAcknowledge = async (requestId) => {
    await onAssistanceAction(requestId, 'acknowledge');
    handleModalClose();
  };

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
    <div className="flex flex-col h-full">
      {/* Header - now simplified since tabs handle the title */}
      <div className="px-4 py-3 bg-orange-50 border-b border-orange-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HandHeart className="w-4 h-4 text-orange-600" />
            <h3 className="font-medium text-orange-800">Active Requests</h3>
          </div>
          {assistanceRequests.length > 0 && (
            <span className="text-xs bg-orange-200 text-orange-700 px-2 py-1 rounded-full font-medium">
              {assistanceRequests.length}
            </span>
          )}
        </div>
      </div>

      {/* List - scrollable content area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-2 space-y-2">
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

            <p className="text-sm mb-2">{request.message}</p>
            
            {/* Show staff acknowledgment info */}
            {request.acknowledged_by && (
              <p className="text-xs text-gray-500 mb-2">
                Acknowledged by staff member
              </p>
            )}

            <div className="flex gap-2">
              {(request.status === 'pending' || request.status === 'acknowledged') && (
                <button
                  onClick={() => handleRequestClick(request)}
                  className="flex-1 bg-white text-blue-700 border border-blue-300 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  Manage Request
                </button>
              )}
            </div>
          </div>
        ))}
        </div>
      </div>

      {/* Resolution Modal */}
      <AssistanceResolveModal
        request={selectedRequest}
        isVisible={showModal}
        onResolve={handleResolveWithNotes}
        onAcknowledge={handleAcknowledge}
        onCancel={handleModalClose}
      />
    </div>
  );
};

export default KioskAssistanceList;