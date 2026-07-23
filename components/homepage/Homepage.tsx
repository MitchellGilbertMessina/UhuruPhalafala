"use client";

import Header from "../layout/Header";
import Navigation from "../navigation/Navigation";

export default function Homepage() {
  return (
    <main
      className="flex h-screen flex-col"
      style={{
        background: "#C0BCC6",
      }}
    >
      <Header />

      <Navigation />
    </main>
  );
}