// QuestionManagementTab.js — Comprehensive question management with better UX

import React, { useState } from 'react';
import { Plus, Search, Edit3, Trash2, GripVertical, Archive, RotateCcw } from 'lucide-react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import ReplaceModal from '../../common/ReplaceModal';

// Suggested Questions Component - moved outside to prevent re-creation
const SuggestedQuestionsSection = ({ filteredSuggestedQuestions, setNewQuestion }) => (
    <div className="mb-8">
      <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
          <Plus className="w-4 h-4 text-blue-600" />
        </div>
        Quick Start - Suggested Questions
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredSuggestedQuestions.map((question, index) => (
          <div
            key={index}
            onClick={() => setNewQuestion(question)}
            className="group bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-800">{question}</p>
              <Plus className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>
      {filteredSuggestedQuestions.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">All suggested questions have been added!</p>
        </div>
      )}
    </div>
  );

// Create New Question Component - moved outside to prevent re-creation
const CreateQuestionSection = ({ 
  newQuestion, 
  handleNewQuestionChange, 
  questions, 
  duplicateError, 
  handleAddQuestion 
}) => (
    <div className="mb-8">
      <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
          <Edit3 className="w-4 h-4 text-green-600" />
        </div>
        Create Custom Question
      </h3>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="new-question" className="block text-sm font-medium text-gray-700 mb-2">
              Question Text
            </label>
            <div className="relative">
              <input
                id="new-question"
                type="text"
                placeholder="Enter your custom question..."
                value={newQuestion}
                onChange={(e) => handleNewQuestionChange(e)}
                className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={100}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                {newQuestion.length}/100
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {questions.length >= 5 && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  <span className="text-xs font-medium text-amber-700">Will replace existing question</span>
                </div>
              )}
              {duplicateError && (
                <p className="text-xs text-red-600">{duplicateError}</p>
              )}
            </div>
            <button
              onClick={handleAddQuestion}
              disabled={!newQuestion.trim()}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                !newQuestion.trim()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
              }`}
            >
              <Plus className="w-4 h-4" />
              {questions.length >= 5 ? 'Replace Question' : 'Add Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

// Active Questions Component - moved outside to prevent re-creation
const ActiveQuestionsSection = ({ 
  questions, 
  editingQuestionId, 
  editingQuestionText, 
  handleEditTextChange, 
  cancelEditingQuestion, 
  saveEditedQuestion, 
  startEditingQuestion, 
  handleDeleteQuestion 
}) => (
    <div className="mb-8">
      <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
          <GripVertical className="w-4 h-4 text-purple-600" />
        </div>
        Current Questions ({questions.length}/5)
      </h3>
      
      {questions.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Edit3 className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Active Questions</h4>
            <p className="text-gray-600 mb-4">
              Create your first feedback question using the suggestions above or write a custom one.
            </p>
          </div>
        </div>
      ) : (
        <Droppable droppableId="questions">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-3 transition-colors duration-200 ${
                snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-2' : ''
              }`}
            >
              {questions.map((q, index) => (
                <Draggable key={q.id} draggableId={q.id.toString()} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`bg-white border rounded-lg transition-all duration-200 ${
                        snapshot.isDragging 
                          ? 'shadow-lg border-blue-300 rotate-1' 
                          : 'border-gray-200 hover:shadow-md'
                      }`}
                    >
                      <div className="p-5">
                        {editingQuestionId === q.id ? (
                          // Edit mode
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Edit Question
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={editingQuestionText}
                                  onChange={(e) => handleEditTextChange(e.target.value)}
                                  className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  maxLength={100}
                                  autoFocus
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                  {editingQuestionText.length}/100
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-end space-x-3">
                              <button
                                onClick={cancelEditingQuestion}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={saveEditedQuestion}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Display mode
                          <div className="flex items-center space-x-4">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-50 rounded-md transition-colors"
                            >
                              <GripVertical className="w-5 h-5 text-gray-400" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-1">
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                  {index + 1}
                                </span>
                                <h4 className="font-medium text-gray-900">{q.question}</h4>
                              </div>
                              <p className="text-xs text-gray-500">Customers will rate this 1-5 stars</p>
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => startEditingQuestion(q.id, q.question)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
                                title="Edit question"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200"
                                title="Archive question"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      )}
    </div>
  );

// Archive Section Component - moved outside to prevent re-creation
const ArchiveSection = ({ 
  inactiveQuestions, 
  searchTerm, 
  setSearchTerm, 
  filteredInactiveQuestions, 
  handleAddInactive 
}) => (
    <div>
      <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
          <Archive className="w-4 h-4 text-gray-600" />
        </div>
        Question Archive ({inactiveQuestions.length})
      </h3>

      {inactiveQuestions.length > 0 && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search archived questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg">
        {filteredInactiveQuestions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? (
              <>
                <Search className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                <p className="font-medium mb-1">No questions found</p>
                <p className="text-sm">Try adjusting your search terms</p>
              </>
            ) : (
              <>
                <Archive className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                <p className="font-medium mb-1">No archived questions</p>
                <p className="text-sm">Questions you remove will appear here</p>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredInactiveQuestions.map((q) => (
              <div
                key={q.id}
                className="p-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                onClick={() => handleAddInactive(q)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 mb-1">{q.question}</p>
                    <p className="text-xs text-gray-500">Click to reactivate</p>
                  </div>
                  <div className="flex items-center space-x-3 ml-4">
                    <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      Archived
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddInactive(q);
                      }}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-all duration-200"
                      title="Reactivate question"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

const QuestionManagementTab = ({
  questions,
  newQuestion,
  editingQuestionId,
  editingQuestionText,
  inactiveQuestions,
  searchTerm,
  isReplaceModalOpen,
  selectedInactiveQuestion,
  pendingNewQuestion,
  replacementSource,
  duplicateError,
  filteredSuggestedQuestions,
  setNewQuestion,
  setSearchTerm,
  setIsReplaceModalOpen,
  setSelectedInactiveQuestion,
  setReplacementSource,
  handleAddQuestion,
  handleNewQuestionChange,
  startEditingQuestion,
  handleDeleteQuestion,
  saveEditedQuestion,
  cancelEditingQuestion,
  handleEditTextChange,
  handleAddInactiveQuestion,
  handleReplaceQuestion,
}) => {
  const [view, setView] = useState('active'); // 'active', 'create', 'archive'
  
  const handleAddInactive = (question) => {
    if (questions.length >= 5) {
      setSelectedInactiveQuestion(question);
      setReplacementSource('inactive');
      setIsReplaceModalOpen(true);
    } else {
      handleAddInactiveQuestion(question);
    }
  };

  const filteredInactiveQuestions = inactiveQuestions.filter(q =>
    q.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-none">
      <div className="space-y-8">
        <SuggestedQuestionsSection 
          filteredSuggestedQuestions={filteredSuggestedQuestions}
          setNewQuestion={setNewQuestion}
        />
        <CreateQuestionSection 
          newQuestion={newQuestion}
          handleNewQuestionChange={handleNewQuestionChange}
          questions={questions}
          duplicateError={duplicateError}
          handleAddQuestion={handleAddQuestion}
        />
        <ActiveQuestionsSection 
          questions={questions}
          editingQuestionId={editingQuestionId}
          editingQuestionText={editingQuestionText}
          handleEditTextChange={handleEditTextChange}
          cancelEditingQuestion={cancelEditingQuestion}
          saveEditedQuestion={saveEditedQuestion}
          startEditingQuestion={startEditingQuestion}
          handleDeleteQuestion={handleDeleteQuestion}
        />
        <ArchiveSection 
          inactiveQuestions={inactiveQuestions}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredInactiveQuestions={filteredInactiveQuestions}
          handleAddInactive={handleAddInactive}
        />
      </div>

      <ReplaceModal
        isOpen={isReplaceModalOpen}
        onRequestClose={() => setIsReplaceModalOpen(false)}
        replacementSource={replacementSource}
        pendingNewQuestion={pendingNewQuestion}
        selectedInactiveQuestion={selectedInactiveQuestion}
        questions={questions}
        onReplaceQuestion={handleReplaceQuestion}
      />
    </div>
  );
};

export default QuestionManagementTab;