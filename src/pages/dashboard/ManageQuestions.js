// ManageQuestions.js — Refactored with tabbed interface like ReportsPage

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../utils/supabase';
import { DragDropContext } from 'react-beautiful-dnd';
import PageContainer from '../../components/dashboard/layout/PageContainer';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import AlertModal from '../../components/ui/AlertModal';

// Import tab components
import QRCodeTab from '../../components/dashboard/feedback/QRCodeTab';
import QuestionManagementTab from '../../components/dashboard/feedback/QuestionManagementTab';

const ManageQuestions = () => {
  usePageTitle('Feedback Manager');
  const { venueId } = useVenue();

  // State for active tab
  const [activeTab, setActiveTab] = useState('QRCode');
  // Add mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // All your existing state variables
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
  const [alertModal, setAlertModal] = useState(null);

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

  // Navigation items
  const navItems = [
    { id: 'QRCode', label: 'QR Code & Sharing' },
    { id: 'Questions', label: 'Question Management' },
  ];

  // Close mobile menu when tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

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
      setAlertModal({
        type: 'warning',
        title: 'Invalid Question',
        message: 'Question cannot be empty.'
      });
      return;
    }

    if (newQuestion.length > 100) {
      setAlertModal({
        type: 'warning',
        title: 'Question Too Long',
        message: 'Question cannot exceed 100 characters.'
      });
      return;
    }

    const isDuplicate = await checkForDuplicateQuestion(newQuestion, true);
    if (isDuplicate) {
      setAlertModal({
        type: 'warning',
        title: 'Duplicate Question',
        message: 'This question already exists.'
      });
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
      setAlertModal({
        type: 'warning',
        title: 'Missing Question',
        message: 'Please enter a question to add.'
      });
      return;
    }

    if (replacementSource === 'inactive' && !selectedInactiveQuestion) {
      setAlertModal({
        type: 'warning',
        title: 'No Selection',
        message: 'Please select a question to re-add.'
      });
      return;
    }

    const questionToAdd = replacementSource === 'new' ? pendingNewQuestion : selectedInactiveQuestion.question;

    if (replacementSource === 'new') {
      const isDuplicate = await checkForDuplicateQuestion(questionToAdd, true);
      if (isDuplicate) {
        setAlertModal({
          type: 'warning',
          title: 'Duplicate Question',
          message: 'This question already exists. Please select a unique question.'
        });
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

  const cancelEditingQuestion = () => {
    setEditingQuestionId(null);
    setEditingQuestionText('');
  };

  const handleEditTextChange = (newText) => {
    setEditingQuestionText(newText);
  };

  const saveEditedQuestion = async () => {
    if (!editingQuestionText.trim()) {
      setAlertModal({
        type: 'warning',
        title: 'Invalid Question',
        message: 'Question cannot be empty.'
      });
      return;
    }

    if (editingQuestionText.length > 100) {
      setAlertModal({
        type: 'warning',
        title: 'Question Too Long',
        message: 'Question cannot exceed 100 characters.'
      });
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

  // Props to pass to tab components
  const tabProps = {
    // Data
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
    addedSuggestedQuestions,
    suggestedQuestions,
    filteredSuggestedQuestions,
    feedbackUrl,
    venueId,
    qrCodeRef,

    // Setters
    setNewQuestion,
    setEditingQuestionId,
    setEditingQuestionText,
    setSearchTerm,
    setIsReplaceModalOpen,
    setSelectedInactiveQuestion,
    setPendingNewQuestion,
    setReplacementSource,
    setDuplicateError,

    // Actions
    handleAddQuestion,
    handleAddInactiveQuestion,
    handleReplaceQuestion,
    handleNewQuestionChange,
    onDragEnd,
    startEditingQuestion,
    cancelEditingQuestion,
    handleEditTextChange,
    saveEditedQuestion,
    handleDeleteQuestion,
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'QRCode':
        return <QRCodeTab {...tabProps} />;
      case 'Questions':
        return <QuestionManagementTab {...tabProps} />;
      default:
        return <QuestionManagementTab {...tabProps} />;
    }
  };

  if (!venueId) {
    return null;
  }

  return (
    <PageContainer>
      <div className="max-w-none lg:max-w-7xl">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Feedback Manager</h1>
              <p className="text-gray-600 text-sm lg:text-base">Create and organize customer feedback questions.</p>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-custom-blue font-medium">Questions Active: {questions.length}/5</span>
            </div>
          </div>
        </div>

        {/* Mobile Tab Selector */}
        <div className="lg:hidden mb-6">
          <div className="relative">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-full bg-white border border-gray-300 rounded-md px-4 py-3 text-left text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <span className="block truncate">
                {navItems.find(item => item.id === activeTab)?.label || 'Select Tab'}
              </span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </button>

            {isMobileMenuOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      activeTab === item.id ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Desktop Sidebar - Hidden on mobile */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    activeTab === item.id
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <DragDropContext onDragEnd={onDragEnd}>
              {renderActiveTab()}
            </DragDropContext>
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={!!alertModal}
        onClose={() => setAlertModal(null)}
        title={alertModal?.title}
        message={alertModal?.message}
        type={alertModal?.type}
      />
    </PageContainer>
  );
};

export default ManageQuestions;