
import React from 'react';
import ReactMarkdown from 'react-markdown';
import Layout from '@/components/Layout';

const changelogContent = `# Changelog

Welcome to the changelog for PawCult! Here you can follow our journey as we build the ultimate social app for pets and their parents, one feature at a time.

### **July 21 - July 27, 2025**

🚀 Launch & Major Mobile Improvements!

This week was a whirlwind of excitement as we officially launched in Sweden and rolled out a massive update to the mobile experience!

* **📱 Sleek New Mobile Experience:** We've completely revamped the mobile view! It's now more beautiful, user-friendly, and accessible on the go.
* **🇸🇪 Sweden, Meet PawCult!** The app has officially launched to friends and communities in Sweden. The marketing journey has begun!
* **🗺️ A Welcoming Guide:** New users will now be greeted with a helpful app tour to guide them through all of PawCult's amazing features.
* **🔒 Fort Knox Security:** We've tackled a ton of security issues to make the platform safer and more secure for you and your furry friends.
* **📬 Contact Us with a Click:** We've made it easier than ever to get in touch by adding a new "Contact Me" section.
* **🤖 Android App on the Horizon:** Get ready for more growth! The Google Play app is just a few days away from launching.

### **July 14 - July 20, 2025**

🔧 Building the Future: Pet Sitter Marketplace!

This week was all about laying the groundwork for one of our most requested features: a pet sitter marketplace.

* **🐛 Critical Bug Fix:** We successfully diagnosed and fixed a critical bug that was preventing the new pet sitter section from loading.
* **🗺️ Blueprint Finalized:** We finalized the entire blueprint for the pet sitter marketplace feature, including detailed plans for sitter profiles, search functionality, and booking management pages.

### **July 7 - July 13, 2025**

🛠️ Rock-Solid & User-Friendly!

We dedicated this week to making the app more reliable and enjoyable to use, tackling some major bugs and UI improvements.

* **🐛 Critical Bugs Squashed:** We've permanently solved the frustrating app loading stalls that happened after login and after granting location permission.
* **✨ Upgraded PWA Experience:** The PWA bottom navigation bar is now bigger, more responsive, and always visible. We also created proper home screen icons from the app logo.
* **⬆️ Improved Navigation:** We've added a much-needed "Back" button to the Sign In/Sign Up pages and implemented a persistent navigation system for both desktop and mobile.
* **🔋 Optimized Performance:** The "Ready to Play" feature now updates your location at a battery-friendly 60-second interval.

### **June 30 - July 6, 2025**

🔋 Strengthening the Foundation!

This week was all about strengthening the foundation of the app and fixing critical bugs.

* **📲 Push Notification Opt-Ins:** We've implemented the complete user-facing flow for push notification opt-ins, from the UI toggle to storing the subscription token.
* **🐞 Major Bug Diagnosis:** We diagnosed a major app-loading bug caused by expired sessions and created a detailed plan to fix it permanently.

### **June 23 - June 29, 2025**

🚀 A Week of Massive Progress!

This was an incredibly productive week, with a major overhaul of the landing page and a huge number of core application features implemented.

* **🗣️ Landing Page Overhaul (Based on Community Feedback):** Restructured the landing page to build user trust and improve clarity. Improved color contrast and humanized all the text. Removed placeholder testimonials.
* **🛠️ Core App Development:** We implemented a huge suite of features from our roadmap, including secure backend and authentication, a brand new changelog, improved user and pet profiles, the real-time map-based "Playdate Finder," a social feed, a notification system, and the initial framework for business profiles and discounts.

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
