"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

import { twMerge } from "tailwind-merge";

interface ScrollRevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    width?: "fit-content" | "100%";
}

export function ScrollReveal({
    children,
    className,
    delay = 0,
    width = "fit-content"
}: ScrollRevealProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }} // Custom easing for smooth feel
            style={{ width }}
            className={twMerge("", className)}
        >
            {children}
        </motion.div>
    );
}
