import React from 'react';

const SuggestedQuestions = ({ suggestedQuestions, onQuestionClick }) => {
  if (suggestedQuestions.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Suggested Questions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestedQuestions.map((question, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-blue-500 transition-colors duration-200"
            onClick={() => onQuestionClick(question)}
          >
            <p className="text-gray-700">{question}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedQuestions;