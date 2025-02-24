import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const NotificationBar = ({ message, type, onClose }) => {
  const typeStyles = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-yellow-500 text-black",
    info: "bg-blue-500 text-white",
  };

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 w-[90%] max-w-lg p-4 rounded-lg shadow-lg flex items-center justify-between ${typeStyles[type]}`}
    >
      <span className="text-sm font-semibold">{message}</span>
      <button onClick={onClose} className="ml-4">
        <X className="w-5 h-5 cursor-pointer" />
      </button>
    </motion.div>
  );
};

export default NotificationBar;
