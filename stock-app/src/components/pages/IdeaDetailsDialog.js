import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { X } from "lucide-react";

const IdeaDetailsDialog = ({ isOpen, onClose, idea }) => {
  const renderContent = (data, level = 0) => {
    if (!data || typeof data !== "object") return null;

    return Object.entries(data).map(([key, value], index) => (
      <div
        key={index}
        className={`w-full ${level === 0 ? "mb-6" : "mb-4"}`}
      >
        <h3
          className={`${
            level === 0 ? "text-xl font-semibold" : "text-lg font-medium"
          } capitalize text-primary mb-2`}
        >
          {key.replace(/_/g, " ")}
        </h3>

        <div className={`pl-4 border-l-4 border-gray-300 space-y-2`}>
          {Array.isArray(value) ? (
            <div className="space-y-2">
              {value.map((item, idx) => (
                <div key={idx} className="py-1">
                  {typeof item === "object" ? (
                    renderContent(item, level + 1)
                  ) : (
                    <div className="py-2 px-4 bg-gray-100 rounded-lg shadow-sm text-gray-700">
                      {item}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : typeof value === "object" ? (
            renderContent(value, level + 1)
          ) : (
            <div className="py-2 px-4 bg-gray-100 rounded-lg shadow-sm text-gray-700 w-auto pb-5 pt-5 text-xl">
              {value}
            </div>
          )}
        </div>
      </div>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full sm:max-w-4xl overflow-y-auto rounded-lg shadow-xl bg-white transition-all duration-200">
        <DialogHeader className="flex justify-between items-center border-b pb-3">
          <DialogTitle className="text-2xl font-bold text-gray-800">
            {idea?.idea_name || "Business Idea Details"}
          </DialogTitle>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </DialogHeader>

        {/* Idea Details */}
        <div className="mt-4 space-y-4 p-4">
          {renderContent(idea)}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IdeaDetailsDialog;
