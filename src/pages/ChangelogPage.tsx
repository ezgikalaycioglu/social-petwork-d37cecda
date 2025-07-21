
import React from 'react';
import ReactMarkdown from 'react-markdown';
import Layout from '@/components/Layout';

const changelogContent = `# Changelog

Welcome to the changelog for PawCult! Here you can follow our journey as we build the ultimate social app for pets and their parents, one feature at a time.

### **June 27, 2025**

This update focuses on stability and adding a feature with real-world impact. We've also integrated analytics to start making data-driven decisions.

* **✨ New:** Pets can now be marked as "Open for Adoption." A special badge will appear on their profile, and owners must go through a confirmation step to prevent accidental changes.
* **✨ New:** Integrated a comprehensive analytics suite (Mixpanel) to understand user behavior, identify popular features, and guide future development.
* **🐞 Fixed:** Addressed a systematic page loading issue that occurred after login, improving the stability and reliability of the entire application.

### **June 26, 2025**

This week was all about making the app feel alive and social! We've introduced a central social feed and a push notification system to keep users connected and engaged.

* **✨ New:** The "Social Feed" is now live! The new home screen shows a real-time, chronological feed of recent activities, including new adventures, photos, and upcoming group walks.
* **✨ New:** Implemented a robust push notification system to deliver timely alerts for playdate requests, event confirmations, and other important social interactions.

### **June 25, 2025**

With the core social features in place, we're now building out the ecosystem. This update introduces our first monetization feature and a way to create lasting memories.

* **✨ New:** Business Profiles & Exclusive Discounts are here! Local pet businesses can now create profiles and offer deals, which users can discover and claim within the app.
* **✨ New:** Introduced "Adventure Tracking," allowing users to log their hikes, park visits, and trips with photos and journal entries, creating a beautiful timeline of their pet's life.

### **June 24, 2025**

This was a landmark week! We've launched the core utility of the app: finding and connecting with other pets in real-time.

* **✨ New:** Launched the "Playdate Finder," a real-time, location-based map showing nearby pets who are ready to play.
* **✨ New:** Users can now send and receive playdate requests and create public "Group Walks" that others can join.
* **🔧 Improved:** The pet location system was designed with privacy as a priority, using generalized locations and requiring user consent.

### **June 23, 2025**

The foundation is complete! This initial version focuses on creating the core building blocks of our community: the pets and their parents.

* **✨ New:** Users can now create detailed, beautiful profiles for their pets, including photos, personality traits, and a biography.
* **✨ New:** A dedicated "User Settings" page allows pet parents to manage their own profile and notification preferences.
* **✨ New:** Implemented a secure authentication system with email/password and social login options.
* **✨ New:** Set up the core backend infrastructure using Supabase for the database, authentication, and storage.`;

const ChangelogPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg lg:prose-xl max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900">
            <ReactMarkdown>{changelogContent}</ReactMarkdown>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChangelogPage;
