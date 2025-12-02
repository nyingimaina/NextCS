"use client";

import AnimatedMount from "@/musketeer/AnimatedMount";
import Home from "./Home";

export default function HomePage() {
  return (
    <AnimatedMount>
      <Home />
    </AnimatedMount>
  );
}
