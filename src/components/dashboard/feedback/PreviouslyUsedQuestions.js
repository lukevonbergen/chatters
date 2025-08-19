import React from 'react';
import { Plus } from 'lucide-react';

const PreviouslyUsedQuestions = ({ inactiveQuestions, searchTerm, onSearchChange, onAddInactiveQuestion }) => {
  const filteredQuestions = inactiveQuestions.filter(q =>
    q.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-none lg:max-w-6xl mb-6 lg:mb-8">
      <div className="mb-4 lg:mb-6">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Previously Used Questions</h2>
        <p className="text-gray-600 text-sm">
          Reactivate questions you've used before by clicking on them.
        </p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search previously used questions..."
          value={searchTerm}
          onChange={onSearchChange}
          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-8 lg:py-12 text-gray-500">
            {searchTerm ? (
              <>
                <p className="text-base lg:text-lg mb-2">No questions found</p>
                <p className="text-sm">Try adjusting your search terms</p>
              </>
            ) : (
              <>
                <p className="text-base lg:text-lg mb-2">No previously used questions</p>
                <p className="text-sm">Questions you deactivate will appear here for reuse</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2 lg:space-y-3">
            {filteredQuestions.map((q) => (
              <div
                key={q.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 lg:p-4 bg-gray-50 rounded-md space-y-3 sm:space-y-0 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                onClick={() => onAddInactiveQuestion(q)}
              >
                <div className="flex items-center space-x-3 lg:space-x-4 flex-1 min-w-0">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs lg:text-sm font-medium text-gray-700">
                      Q
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {q.question}
                    </p>
                    <p className="text-xs text-gray-500">Click to reactivate</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Inactive
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddInactiveQuestion(q);
                    }}
                    className="p-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200"
                    title="Reactivate question"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary card */}
      {filteredQuestions.length > 0 && (
        <div className="mt-4 lg:mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2 lg:mb-3">Question Archive</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 text-sm">
            <div className="flex justify-between sm:block">
              <span className="text-gray-700">Total Archived:</span>
              <span className="ml-2 font-medium">{inactiveQuestions.length}</span>
            </div>
            <div className="flex justify-between sm:block">
              <span className="text-gray-700">Showing:</span>
              <span className="ml-2 font-medium">{filteredQuestions.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviouslyUsedQuestions;