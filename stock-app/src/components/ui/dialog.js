import * as React from "react";

const Dialog = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-l w-full h-full animate-fade-in">
      <div className="relative bg-white rounded-lg shadow-xl w-[70%] max-w-xxl p-6 transition-transform transform scale-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
        >
          ✖
        </button>

        {children}
      </div>
    </div>
  );
};

const DialogTrigger = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
  >
    {children}
  </button>
);

const DialogContent = ({ children }) => (
  <div className="p-4 text-gray-800 max-h-[70vh] overflow-y-auto w-auto">
    {children}
  </div>
);

const DialogHeader = ({ children }) => (
  <div className="text-xl font-semibold border-b pb-3 mb-3">{children}</div>
);

const DialogTitle = ({ children }) => (
  <h2 className="text-lg font-bold text-gray-900">{children}</h2>
);

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle };
