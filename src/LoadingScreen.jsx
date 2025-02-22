import { motion } from "framer-motion";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 text-white">
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-4 h-4 bg-white rounded-full"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        <motion.p
          className="mt-4 text-lg font-semibold tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
        >
          Loading...
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
