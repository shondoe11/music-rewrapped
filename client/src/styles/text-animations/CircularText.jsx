import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

const CircularText = ({
  text,
  spinDuration = 20,
  fontSize = "1.2rem",
  radius = 90,
  textColor = "#FFFFFF", 
  reverse = false,
}) => {
  const letters = Array.from(text);
  const controls = useAnimation();
  const [currentRotation, setCurrentRotation] = useState(0);
  //& direction multiplier on reverse prop
  const direction = reverse ? -1 : 1;

  useEffect(() => {
    //~ update animation on spinDuration change
    controls.start({
      rotate: currentRotation + (360 * direction),
      transition: {
        from: currentRotation,
        to: currentRotation + (360 * direction),
        ease: "linear",
        duration: spinDuration,
        type: "tween",
        repeat: Infinity,
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinDuration, direction]);

  return (
    <motion.div
      initial={{ rotate: 0 }}
      className="relative rounded-full w-full h-full text-center origin-center"
      animate={controls}
      onUpdate={(latest) => setCurrentRotation(Number(latest.rotate))}
    >
      {letters.map((letter, i) => {
        const angle = ((i / letters.length) * 360) * (Math.PI / 180);
        const x = radius * Math.cos(angle - Math.PI / 2);
        const y = radius * Math.sin(angle - Math.PI / 2);
        
        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${(360 / letters.length) * i}deg)`,
              fontSize: fontSize,
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              color: textColor,
            }}
          >
            {letter}
          </div>
        );
      })}
    </motion.div>
  );
};

export default CircularText;