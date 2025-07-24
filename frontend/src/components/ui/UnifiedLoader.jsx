import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Unified Loading System for Code Battle
const UnifiedLoader = ({ 
  type = "default", 
  message = "Loading...", 
  duration = 2000,
  onComplete = null 
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const words = ["Eat", "Code", "Repeat"];

  // Auto-complete timer
  useEffect(() => {
    if (duration && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onComplete]);

  // Word cycling for landing page loader
  useEffect(() => {
    if (type === "landingPage") {
      const interval = setInterval(() => {
        setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [type]);

  // Unified theme configuration
  const getThemeConfig = () => {
    switch (type) {
      case "landingPage":
        return {
          bg: "bg-[#F5F5DC]", // Beige background
          primaryText: "text-black",
          secondaryText: "text-gray-600",
          brandText: "text-black",
          loadingText: "text-gray-600"
        };
      case "dashboard":
        return {
          bg: "bg-[#F5F5DC]", // Changed from black to beige
          primaryText: "text-black", // Changed from white to black for better contrast
          secondaryText: "text-gray-600", // Changed from gray-400 to gray-600
          brandText: "text-black",
          loadingText: "text-gray-700"
        };
      default:
        return {
          bg: "bg-[#F5F5DC]",
          primaryText: "text-black",
          secondaryText: "text-gray-600",
          brandText: "text-black",
          loadingText: "text-gray-700"
        };
    }
  };

  const theme = getThemeConfig();

  // Animation variants
  const wordVariants = {
    initial: {
      opacity: 0,
      filter: "blur(10px)",
      y: 10
    },
    animate: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: {
      opacity: 0,
      filter: "blur(8px)",
      y: -10,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const fadeInVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  // Content renderers
  const renderLandingPageContent = () => (
    <>
      {/* Animated Words */}
      <div className="relative h-20 flex items-center justify-center mb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWordIndex}
            variants={wordVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute"
          >
            <span className="text-5xl md:text-6xl font-black text-black font-['Outreque']">
              {words[currentWordIndex]}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Loading Message */}
      <motion.p
        className={`${theme.loadingText} text-lg font-medium tracking-wide font-['Outreque']`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        Loading your coding arena...
      </motion.p>
    </>
  );

  const renderDashboardContent = () => (
    <>
      {/* Animated Dots */}
      <div className="relative h-20 flex items-center justify-center mb-12">
        <motion.div
          className="flex space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-3 h-3 bg-red-500 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2
              }}
            />
          ))}
        </motion.div>
      </div>
      {/* Main Message */}
      <motion.p
        className={`${theme.primaryText} text-xl font-bold tracking-wide font-['Outreque']`}
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 1, delay: 1 }}
      >
        Preparing your battle arena...
      </motion.p>
      {/* Sub Message */}
      <motion.p
        className={`${theme.secondaryText} text-sm mt-4 font-['Outreque']`}
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 1, delay: 1.5 }}
      >
        Setting up your coding battlefield
      </motion.p>
    </>
  );

  const renderDefaultContent = () => (
    <>
      {/* Generic Loading Animation */}
      <div className="relative h-20 flex items-center justify-center mb-12">
        <motion.div
          className="flex space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-3 h-3 bg-red-500 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2
              }}
            />
          ))}
        </motion.div>
      </div>
      {/* Loading Message */}
      <motion.p
        className={`${theme.loadingText} text-lg font-medium tracking-wide font-['Outreque']`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        {message}
      </motion.p>
    </>
  );

  const renderContent = () => {
    switch (type) {
      case "landingPage":
        return renderLandingPageContent();
      case "dashboard":
        return renderDashboardContent();
      default:
        return renderDefaultContent();
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${theme.bg}`}>
      {/* Main Content */}
      <div className="text-center">
        {/* Brand */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className={`text-3xl md:text-4xl font-bold ${theme.brandText} mb-2 font-['Outreque']`}>
            Code
            <span className="text-red-500">Battle</span>
          </h1>
          <p className={`${theme.secondaryText} text-sm font-['Outreque']`}>
            Gamified Coding
          </p>
        </motion.div>

        {/* Dynamic Content */}
        {renderContent()}
      </div>
    </div>
  );
};

// Specific loader variants for easy usage
export const LandingPageLoader = (props) => (
  <UnifiedLoader type="landingPage" {...props} />
);

export const DashboardLoader = (props) => (
  <UnifiedLoader type="dashboard" {...props} />
);

export const GenericLoader = (props) => (
  <UnifiedLoader type="default" {...props} />
);

export default UnifiedLoader;