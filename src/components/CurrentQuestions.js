import React from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';

const CurrentQuestions = ({ questions, onEdit, onDelete, onDragEnd, editingQuestionId, editingQuestionText, onSaveEdit, onCancelEdit, onEditTextChange }) => {
  
  return (
    <div className="max-w-none lg:max-w-6xl mb-6 lg:mb-8">
      <div className="mb-4 lg:mb-6">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Current Questions</h2>
        <p className="text-gray-600 text-sm">
          You can drag and drop these questions in the order your customers will answer them.
          The answers will be on a scale from 1-5.
        </p>
      </div>
      
      <Droppable droppableId="questions">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3 lg:space-y-4">
            {questions.map((q, index) => (
              <Draggable key={q.id} draggableId={q.id.toString()} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      {editingQuestionId === q.id ? (
                        // Edit mode
                        <div className="flex-1 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                          <input
                            type="text"
                            value={editingQuestionText}
                            onChange={(e) => onEditTextChange(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                            maxLength={100}
                            autoFocus
                          />
                          <div className="flex gap-2 w-full sm:w-auto">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSaveEdit();
                              }}
                              className="flex-1 sm:flex-none bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onCancelEdit();
                              }}
                              className="flex-1 sm:flex-none text-gray-600 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Display mode
                        <>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{q.question}</p>
                            <p className="text-xs text-gray-500">Question {index + 1}</p>
                          </div>
                          <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(q.id, q.question);
                              }}
                              className="flex-1 sm:flex-none text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-1"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(q.id);
                              }}
                              className="flex-1 sm:flex-none text-sm text-red-600 hover:text-red-900 font-medium px-3 py-1"
                            >
                              Delete
                            </button>
                          </div>
                        </>
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
    </div>
  );
};

export default CurrentQuestions;