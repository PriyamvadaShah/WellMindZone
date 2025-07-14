// For App Router: src/app/page.jsx
// OR for Pages Router: src/pages/index.js

'use client'; // Only if using client-side features like useState/useEffect
import React from 'react';
import Home from '../components/Home'; // Adjust the path if needed
import '../styles/index.css';
export default function HomePage() {
  return <Home />;
}
