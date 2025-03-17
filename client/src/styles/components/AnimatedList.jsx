import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';

export const AnimatedItem = ({ 
  children, 
  delay = 0, 
  index, 
  onMouseEnter, 
  onClick,
  initialScale = 0.9,
  animationDuration = 0.3,
  triggerOnce = false
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { 
    amount: 0.5, 
    triggerOnce: triggerOnce
  });
  
  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: initialScale, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: initialScale, opacity: 0 }}
      transition={{ duration: animationDuration, delay }}
      className="mb-4 cursor-pointer"
    >
      {children}
    </motion.div>
  );
};

const AnimatedList = ({
  items = [],
  renderItem,
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  className = '',
  itemClassName = '',
  displayScrollbar = true,
  initialSelectedIndex = -1,
  gradientColors = {
    from: 'rgba(0, 0, 0, 0.3)',
    to: 'transparent'
  },
  itemDelay = 0.05,
  initialScale = 0.9,
  animationDuration = 0.3,
  triggerOnce = false
}) => {
  const listRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);

  const handleScroll = (e) => {
    if (!showGradients) return;
    
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(
      scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1)
    );
  };

  useEffect(() => {
    if (!enableArrowNavigation) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
      } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          e.preventDefault();
          if (onItemSelect) {
            onItemSelect(items[selectedIndex], selectedIndex);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedIndex, onItemSelect, enableArrowNavigation]);

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    const selectedItem = container.querySelector(`[data-index="${selectedIndex}"]`);
    if (selectedItem) {
      const extraMargin = 50;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemBottom = itemTop + selectedItem.offsetHeight;
      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({ top: itemTop - extraMargin, behavior: 'smooth' });
      } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
        container.scrollTo({
          top: itemBottom - containerHeight + extraMargin,
          behavior: 'smooth',
        });
      }
    }
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]);

  return (
    <div className={`relative w-full ${className}`}>
      <div
        ref={listRef}
        className={`max-h-[600px] overflow-y-auto p-4 ${
          displayScrollbar
            ? "scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-gray-700 hover:scrollbar-thumb-gray-600"
            : "scrollbar-hide"
        }`}
        onScroll={handleScroll}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#444 transparent',
        }}
      >
        {items.map((item, index) => (
          <AnimatedItem
            key={index}
            delay={index * itemDelay}
            index={index}
            onMouseEnter={() => setSelectedIndex(index)}
            onClick={() => {
              setSelectedIndex(index);
              if (onItemSelect) {
                onItemSelect(item, index);
              }
            }}
            initialScale={initialScale}
            animationDuration={animationDuration}
            triggerOnce={triggerOnce}
          >
            {renderItem(item, index, selectedIndex === index)}
          </AnimatedItem>
        ))}
      </div>
      {showGradients && (
        <>
          <div
            className="absolute top-0 left-0 right-0 h-[50px] pointer-events-none transition-opacity duration-300 ease"
            style={{ 
              opacity: topGradientOpacity,
              background: `linear-gradient(to bottom, ${gradientColors.from}, ${gradientColors.to})`
            }}
          ></div>
          <div
            className="absolute bottom-0 left-0 right-0 h-[70px] pointer-events-none transition-opacity duration-300 ease"
            style={{ 
              opacity: bottomGradientOpacity,
              background: `linear-gradient(to top, ${gradientColors.from}, ${gradientColors.to})`
            }}
          ></div>
        </>
      )}
    </div>
  );
};

export default AnimatedList;