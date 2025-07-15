// For App Router: src/app/page.jsx
// OR for Pages Router: src/pages/index.js

'use client'; // Only if using client-side features like useState/useEffect
import React from 'react';
import Patients from '../../components/Patients'; // Adjust the path if needed
export default function HomePage() {
  return <Patients />;
}
