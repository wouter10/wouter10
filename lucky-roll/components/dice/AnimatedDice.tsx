"use client";

import { motion } from "framer-motion";
import { DiceFace } from "./DiceFace";

interface AnimatedDiceProps {
  value: number;
  rolling: boolean;
  size?: number;
}

export function AnimatedDice({ value, rolling, size = 120 }: AnimatedDiceProps) {
  return (
    <motion.div
      animate={
        rolling
          ? {
              rotateX: [0, 360, 720, 1080],
              rotateY: [0, 270, 540, 810],
              rotateZ: [0, 45, 0, -45, 0],
              scale: [1, 1.05, 1.1, 1.05, 1],
            }
          : { rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1 }
      }
      transition={
        rolling
          ? { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
          : { duration: 0.3, ease: "easeOut" }
      }
      style={{ perspective: 800, transformStyle: "preserve-3d" }}
    >
      <DiceFace value={value} size={size} />
    </motion.div>
  );
}
