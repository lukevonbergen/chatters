const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white px-6 py-8 rounded-2xl shadow-2xl max-w-md w-full space-y-6 text-center">
      <h2 className="text-xl font-semibold text-gray-900">{message}</h2>

      <div className="flex justify-center gap-4">
        <button
          onClick={onConfirm}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Confirm
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmModal;