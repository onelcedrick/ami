// -*- coding: utf-8 -*-
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function AnimatedGrid({ children }: { children: ReactNode }) {
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {children}
    </motion.div>
  );
}

export function AnimatedItem({ children }: { children: ReactNode }) {
  return <motion.div variants={item}>{children}</motion.div>;
}
