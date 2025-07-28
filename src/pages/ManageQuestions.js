// ManageQuestions.js
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { DragDropContext } from 'react-beautiful-dnd';
import SuggestedQuestions from '../components/SuggestedQuestions';
import CurrentQuestions from '../components/CurrentQuestions';
import AddNewQuestion from '../components/AddNewQuestion';
import QRCodeSection from '../components/QRCodeSection';
import ReplaceModal from '../components/ReplaceModal';
import PreviouslyUsedQuestions from '../components/PreviouslyUsedQuestions';
import PageContainer from '../components/PageContainer';
import usePageTitle from '../hooks/usePageTitle';
import { useVenue } from '../context/VenueContext';

const ManageQuestions = () => {
  usePageTitle('Feedback Manager');
  const { venueId } = useVenue();

  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editingQuestionText, setEditingQuestionText] = useState('');
  const [inactiveQuestions, setInactiveQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [selectedInactiveQuestion, setSelectedInactiveQuestion] = useState(null);
  const [pendingNewQuestion, setPendingNewQuestion] = useState('');
  const [replacementSource, setReplacementSource] = useState(null);
  const [duplicateError, setDuplicateError] = useState('');
  const [addedSuggestedQuestions, setAddedSuggestedQuestions] = useState([]);

  const qrCodeRef = useRef(null);

  const suggestedQuestions = [
    'How was the service today?',
    'How would you rate the atmosphere?',
    'Was your order prepared correctly?',
    'How clean was the venue?',
  ];

  const filteredSuggestedQuestions = suggestedQuestions.filter(
    (question) => !addedSuggestedQuestions.includes(question)
  );

  useEffect(() => {
    if (!venueId) return;
    fetchQuestions(venueId);
    fetchInactiveQuestions(venueId);
  }, [venueId]);

  const fetchQuestions = async (venueId) => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('venue_id', venueId)
      .eq('active', true)
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching questions:', error);
    } else {
      setQuestions(data);
      const addedQuestions = data.map((q) => q.question);
      setAddedSuggestedQuestions(addedQuestions.filter((q) => suggestedQuestions.includes(q)));
    }
  };

  const fetchInactiveQuestions = async (venueId) => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('venue_id', venueId)
      .eq('active', false);

    if (error) {
      console.error('Error fetching inactive questions:', error);
    } else {
      setInactiveQuestions(data);
    }
  };

  const handleAddQuestion = async () => {
    if (questions.length >= 5) {
      setPendingNewQuestion(newQuestion);
      setReplacementSource('new');
      setIsReplaceModalOpen(true);
      return;
    }

    if (!newQuestion.trim()) {
      alert('Question cannot be empty.');
      return;
    }

    if (newQuestion.length > 100) {
      alert('Question cannot exceed 100 characters.');
      return;
    }

    const isDuplicate = await checkForDuplicateQuestion(newQuestion, true);
    if (isDuplicate) {
      alert('This question already exists.');
      return;
    }

    const { data, error } = await supabase
      .from('questions')
      .insert([{ venue_id: venueId, question: newQuestion, order: questions.length, active: true }])
      .select();

    if (error) {
      console.error('Error adding question:', error);
    } else {
      setQuestions([...questions, data[0]]);
      setNewQuestion('');

      if (suggestedQuestions.includes(newQuestion)) {
        setAddedSuggestedQuestions([...addedSuggestedQuestions, newQuestion]);
      }
    }
  };

  const handleAddInactiveQuestion = async (inactiveQuestion) => {
    const { error } = await supabase
      .from('questions')
      .update({ active: true, order: questions.length + 1 })
      .eq('id', inactiveQuestion.id);

    if (error) {
      console.error('Error re-adding inactive question:', error);
    } else {
      fetchQuestions(venueId);
      fetchInactiveQuestions(venueId);
    }
  };

  const checkForDuplicateQuestion = async (questionText, isActive = true) => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('venue_id', venueId)
      .eq('question', questionText)
      .eq('active', isActive);

    if (error) {
      console.error('Error checking for duplicate question:', error);
      return false;
    }

    return data.length > 0;
  };

  const handleReplaceQuestion = async (questionIdToReplace) => {
    if (replacementSource === 'new' && !pendingNewQuestion.trim()) {
      alert('Please enter a question to add.');
      return;
    }

    if (replacementSource === 'inactive' && !selectedInactiveQuestion) {
      alert('Please select a question to re-add.');
      return;
    }

    const questionToAdd = replacementSource === 'new' ? pendingNewQuestion : selectedInactiveQuestion.question;

    if (replacementSource === 'new') {
      const isDuplicate = await checkForDuplicateQuestion(questionToAdd, true);
      if (isDuplicate) {
        alert('This question already exists. Please select a unique question.');
        return;
      }
    }

    await supabase
      .from('questions')
      .update({ active: false })
      .eq('id', questionIdToReplace);

    if (replacementSource === 'new') {
      const { data, error } = await supabase
        .from('questions')
        .insert([{ venue_id: venueId, question: pendingNewQuestion, order: questions.length, active: true }])
        .select();

      if (error) {
        console.error('Error adding new question:', error);
      } else {
        const updatedQuestions = questions.filter((q) => q.id !== questionIdToReplace);
        setQuestions([...updatedQuestions, data[0]]);
        setNewQuestion('');
      }
    } else if (replacementSource === 'inactive') {
      await supabase
        .from('questions')
        .update({ active: true, order: questions.length })
        .eq('id', selectedInactiveQuestion.id);

      fetchQuestions(venueId);
      fetchInactiveQuestions(venueId);
    }

    setPendingNewQuestion('');
    setSelectedInactiveQuestion(null);
    setReplacementSource(null);
    setIsReplaceModalOpen(false);
  };

  const handleNewQuestionChange = (e) => {
    setNewQuestion(e.target.value);
    setDuplicateError('');
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const reorderedQuestions = Array.from(questions);
    const [movedQuestion] = reorderedQuestions.splice(result.source.index, 1);
    reorderedQuestions.splice(result.destination.index, 0, movedQuestion);

    setQuestions(reorderedQuestions);

    const updates = reorderedQuestions.map((q, index) => ({
      id: q.id,
      order: index + 1,
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from('questions')
        .update({ order: update.order })
        .eq('id', update.id);

      if (error) {
        console.error('Error updating question order:', error);
        fetchQuestions(venueId);
        return;
      }
    }
  };

  const startEditingQuestion = (questionId, questionText) => {
    setEditingQuestionId(questionId);
    setEditingQuestionText(questionText);
  };

  const saveEditedQuestion = async () => {
    if (!editingQuestionText.trim()) {
      alert('Question cannot be empty.');
      return;
    }

    if (editingQuestionText.length > 100) {
      alert('Question cannot exceed 100 characters.');
      return;
    }

    const { error } = await supabase
      .from('questions')
      .update({ question: editingQuestionText })
      .eq('id', editingQuestionId);

    if (error) {
      console.error('Error updating question:', error);
    } else {
      const updatedQuestions = questions.map((q) =>
        q.id === editingQuestionId ? { ...q, question: editingQuestionText } : q
      );
      setQuestions(updatedQuestions);
      setEditingQuestionId(null);
      setEditingQuestionText('');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    const { error } = await supabase
      .from('questions')
      .update({ active: false })
      .eq('id', questionId);

    if (error) {
      console.error('Error marking question as inactive:', error);
    } else {
      setQuestions(questions.filter((q) => q.id !== questionId));
      fetchInactiveQuestions(venueId);
    }
  };

  const feedbackUrl = `${window.location.origin}/feedback/${venueId}`;

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Manage Questions</h1>
        <div className="bg-blue-50 px-4 py-2 rounded-lg">
          <span className="text-blue-600 font-medium">Questions Active: {questions.length}/5</span>
        </div>
      </div>

      <QRCodeSection feedbackUrl={feedbackUrl} venueId={venueId} />

      <SuggestedQuestions
        suggestedQuestions={filteredSuggestedQuestions}
        onQuestionClick={(question) => setNewQuestion(question)}
      />

      <AddNewQuestion
        newQuestion={newQuestion}
        onQuestionChange={handleNewQuestionChange}
        onAddQuestion={handleAddQuestion}
        questions={questions}
        duplicateError={duplicateError}
      />

      <DragDropContext onDragEnd={onDragEnd}>
        <CurrentQuestions
          questions={questions}
          onEdit={startEditingQuestion}
          onDelete={handleDeleteQuestion}
        />
      </DragDropContext>

      <PreviouslyUsedQuestions
        inactiveQuestions={inactiveQuestions}
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        onAddInactiveQuestion={(question) => {
          if (questions.length >= 5) {
            setSelectedInactiveQuestion(question);
            setReplacementSource('inactive');
            setIsReplaceModalOpen(true);
          } else {
            handleAddInactiveQuestion(question);
          }
        }}
      />

      <ReplaceModal
        isOpen={isReplaceModalOpen}
        onRequestClose={() => setIsReplaceModalOpen(false)}
        replacementSource={replacementSource}
        pendingNewQuestion={pendingNewQuestion}
        selectedInactiveQuestion={selectedInactiveQuestion}
        questions={questions}
        onReplaceQuestion={handleReplaceQuestion}
      />
    </PageContainer>
  );
};

export default ManageQuestions;