"use client";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-300 text-center py-3 text-xs mt-8 border-t border-gray-700">
      <p>
        Copyright © {currentYear} BMSR - DASI All rights reserved. DASI - UINA
      </p>
    </footer>
  );
}
