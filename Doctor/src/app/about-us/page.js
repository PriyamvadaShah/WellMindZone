import React from 'react';
// Removed lucide-react import as it's causing module not found error
// Removed framer-motion import to avoid potential issues

const App = () => { // Renamed component to App for default export

  // Inline SVG icons to replace lucide-react components
  const HeartPulseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart-pulse">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
      <path d="M3.21 12.78a2.5 2.5 0 1 0-2.43 3.21"/>
      <path d="M21.18 16.02a2.5 2.5 0 1 0 .32-3.41"/>
      <path d="m12 21.35-1.45-1.45"/>
      <path d="m12 21.35 1.45-1.45"/>
      <path d="M8.5 10.5h.01"/>
      <path d="M15.5 10.5h.01"/>
    </svg>
  );

  const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.78 1.28a2 2 0 0 0 .73 2.73l.04.04a2 2 0 0 1 0 2.83l-.04.04a2 2 0 0 0-.73 2.73l.78 1.28a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.78-1.28a2 2 0 0 0-.73-2.73l-.04-.04a2 2 0 0 1 0-2.83l.04-.04a2 2 0 0 0 .73-2.73l-.78-1.28a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87c-.5-.07-1-.13-1.5-.07H16"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );

  const features = [
    {
      icon: HeartPulseIcon, // Using inline SVG component
      title: 'Our Mission',
      description: 'To provide accessible, reliable, and compassionate mental healthcare resources and support to individuals and families in need.',
    },
    {
      icon: SettingsIcon, // Using inline SVG component
      title: 'Our Vision',
      description: 'A world where mental well-being is prioritized, stigma is eliminated, and everyone has access to quality mental healthcare.',
    },
    {
      icon: UsersIcon, // Using inline SVG component
      title: 'Our Values',
      description: 'Compassion, Respect, Integrity, Collaboration etc.',
    },
  ];

  // Placeholder for profile picture, as local imports like '../../assets/profile-pic.jpeg' won't work
  const profilePicUrl = "https://placehold.co/192x192/ADD8E6/000000?text=Profile";

  return (
    <div className="container mx-auto px-4 py-12 font-sans"> {/* Added font-sans for Inter */}
      {/* Hero Section */}
      <div className="bg-blue-50 p-8 rounded-lg mb-12 text-center shadow-md">
        <h1 className="text-4xl sm:text-5xl font-bold text-blue-800 mb-4">About Us</h1>
        <p className="text-lg sm:text-xl text-gray-700 mb-4 leading-relaxed">
         WellMind Zone is an innovative mental healthcare platform designed to simplify access to emotional support and enhance therapeutic care by combining advanced technology with compassionate mental health expertise.
        </p>
        <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
          Our mental healthcare platform offers comprehensive support with 24/7 AI-powered chatbots, secure video conferencing for virtual therapy, and online tools for scheduling, progress tracking, and resources. Accessible anytime, our features ensure personalized, confidential, and flexible care to meet your mental health needs.
        </p>
      </div>

      {/* Mission, Vision, Values Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white p-8 rounded-3xl shadow-xl text-center border border-blue-200 hover:border-blue-400 transition-all duration-300 transform hover:-translate-y-2" // Added transform for hover effect
          >
            {/* Render inline SVG icon component */}
            <feature.icon className="text-5xl sm:text-6xl text-blue-600 mb-6 mx-auto" />
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-blue-700">
              {feature.title}
            </h3>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Team Section */}
      <div className="bg-blue-50 p-8 rounded-lg shadow-md">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-blue-800 mb-8">Meet Our Team</h2>
        <div className="flex flex-wrap justify-center gap-8"> {/* Changed to flex-wrap and added gap */}
          <div
            className="team-member bg-white p-6 shadow-xl rounded-lg text-center border border-blue-200 max-w-sm transform hover:scale-105 transition-all duration-300" // Added transform for hover effect
          >
            <img
              src={profilePicUrl} // Using placeholder URL
              alt="Team Member"
              className="w-48 h-48 rounded-full mx-auto mb-6 object-cover border-4 border-blue-400 shadow-lg"
            />
            <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-blue-700">Priyamvada Shah</h3>
            <p className="text-lg sm:text-xl text-gray-600">Full Stack Developer</p>
          </div>
          <div
            className="team-member bg-white p-6 shadow-xl rounded-lg text-center border border-blue-200 max-w-sm transform hover:scale-105 transition-all duration-300" // Added transform for hover effect
          >
            <img
              src={profilePicUrl} // Using placeholder URL
              alt="Team Member"
              className="w-48 h-48 rounded-full mx-auto mb-6 object-cover border-4 border-blue-400 shadow-lg"
            />
            <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-blue-700">Raina Dixit</h3>
            <p className="text-lg sm:text-xl text-gray-600">Full Stack Developer</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App; // Exporting App as default
