import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ActionCard = ({ question, rating, suggestion }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-100">
    <div className="flex items-start space-x-4">
      <div className="p-2 bg-amber-50 rounded-lg">
        <AlertTriangle className="w-6 h-6 text-amber-600" />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{question}</h3>
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-500 mr-2">Current Rating:</span>
            <span className="text-sm font-bold text-gray-900">{rating}/5</span>
          </div>
        </div>
        <p className="text-gray-600 text-sm">{suggestion}</p>
      </div>
    </div>
  </div>
);

export default ActionCard;