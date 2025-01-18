import React, { useState } from 'react';

const FeedbackTableCard = ({ feedback, onToggleActioned }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">Table {feedback.table_number}</h3>
          <p className="text-sm text-gray-500">
            {new Date(feedback.timestamp).toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-500 hover:text-blue-700"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4">
          {feedback.questions.map((question, index) => (
            <div key={index} className="mb-4">
              <p className="font-semibold">{question.question}</p>
              <p className="text-sm text-gray-600">Rating: {question.rating}</p>
              <p className="text-sm text-gray-600">Answer: {question.answer}</p>
            </div>
          ))}
          {feedback.additional_feedback && (
            <div className="mt-4">
              <p className="font-semibold">Additional Feedback:</p>
              <p className="text-sm text-gray-600">{feedback.additional_feedback}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          onClick={onToggleActioned}
          className={`p-2 rounded-full ${
            feedback.is_actioned
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ✓
        </button>
      </div>
    </div>
  );
};

export default FeedbackTableCard;