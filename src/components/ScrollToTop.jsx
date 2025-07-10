import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaArrowUp } from 'react-icons/fa';
import './ScrollToTop.css';

/**
 * ScrollToTop Component
 *
 * A fixed button that allows users to quickly scroll back to the top.
 * The button changes appearance when scrolled down.
 */
const ScrollToTop = ({ scrollThreshold = 300 }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Check scroll position and update button state
  useEffect(() => {
    const handleScroll = () => {
      // Update button state when scroll position is beyond threshold
      if (window.scrollY > scrollThreshold) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Initial check
    handleScroll();

    // Clean up event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollThreshold]);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Smooth scrolling animation
    });
  };

  return (
    <motion.button
      className={`scroll-to-top-button ${isScrolled ? 'active' : ''}`}
      onClick={scrollToTop}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="العودة إلى الأعلى"
      title="العودة إلى الأعلى"
    >
      <FaArrowUp />
    </motion.button>
  );
};

export default ScrollToTop;
