import React, { useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';

const CurrentQuestions = ({ questions, onEdit, onDelete, onDragEnd, editingQuestionId, editingQuestionText, onSaveEdit, onCancelEdit, onEditTextChange }) => {
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-900">Current Questions</h2>
      <p className="text-sm text-gray-400 mb-4">
        You can drag and drop these questions in the order your customers will answer them.
        The answers will be on a scale from 1-5.
      </p> 
      <Droppable droppableId="questions">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
            {questions.map((q, index) => (
              <Draggable key={q.id} draggableId={q.id.toString()} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      {editingQuestionId === q.id ? (
                        // Edit mode
                        <div className="flex-1 flex gap-2 items-center">
                          <input
                            type="text"
                            value={editingQuestionText}
                            onChange={(e) => onEditTextChange(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            maxLength={100}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSaveEdit();
                              }}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                            >
                              Save
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onCancelEdit();
                              }}
                              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Display mode
                        <>
                          <p className="text-gray-700 text-lg">{q.question}</p>
                          <div className="flex gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(q.id, q.question);
                              }}
                              className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors duration-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(q.id);
                              }}
                              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
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