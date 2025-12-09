import { FaLock, FaSadTear } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

//run this npm install react-icons framer-motion for it to work


export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 p-6"
    >
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
        <div className="flex justify-center mb-4">
          <FaLock className="text-red-500 text-5xl" />
        </div>
        
        <h1 className="text-3xl font-bold text-red-600 mb-2">
          Oops! Access Denied :(
        </h1>
        
        <p className="text-gray-600 mb-6 flex items-center justify-center gap-2">
          <FaSadTear className="text-yellow-500" />  
          You don't have permission to enter this fortress!
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/login")}
          className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Go to Login
        </motion.button>

      </div>
    </motion.div>
  );
}