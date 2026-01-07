"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AddUserForm as AddUserForm } from "./addUser";

export function AddUserFormWrapper() {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <AddUserForm />
      </motion.div>
    </AnimatePresence>
  );
}
