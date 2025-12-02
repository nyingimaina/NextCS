// components/ui/AnimatedMount.tsx
import { motion } from "framer-motion";
import React from "react";

interface Props {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export default function AnimatedMount({
  children,
  delay = 0,
  duration = 0.35,
  className = "",
}: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
}
