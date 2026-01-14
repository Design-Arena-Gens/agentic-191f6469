"use client";

import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en">
    <head>
      <title>NovaForge - AI Video Generator</title>
      <meta
        name="description"
        content="Create stylised AI-driven motion clips directly in your browser."
      />
    </head>
    <body className={inter.className}>{children}</body>
  </html>
);

export default RootLayout;
