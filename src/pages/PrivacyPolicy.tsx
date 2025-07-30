import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import GlobalNavBar from '@/components/GlobalNavBar';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <GlobalNavBar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy for Pawcult</h1>
          <p className="text-muted-foreground">
            Pawcult ("we", "our", or "the app") is a social application developed with Lovable.dev and powered by Supabase. This Privacy Policy outlines what data we collect, how we use it, and your rights regarding your personal information.
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6 space-y-8">
          
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. What Data We Collect</h2>
            <p className="text-muted-foreground mb-4">
              We collect and process the following data from users:
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Email address & password:</h3>
                <p className="text-muted-foreground">
                  Required for secure login and account creation. We do not support third-party login methods.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Location data:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Requested at login and again on the Pet Map screen</li>
                  <li>Only stored and shared when you toggle "Ready to Play" ON</li>
                  <li>When toggled OFF, location storage stops. Permission remains until manually revoked via device/browser settings.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Photos & media:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Users can upload images for pet profiles and pet tweets</li>
                  <li>Only selected files are uploaded; we do not access your gallery automatically</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Pet profiles & usernames:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Public or private profiles with optional pet usernames</li>
                  <li>Users can search for others via pet usernames and send friend requests</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Content & Interactions:</h3>
                <p className="text-muted-foreground">
                  Pet tweets, adventures, likes, comments, event participation, sitter or business listings, and group ("pack") memberships
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">AI Paw Coach:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Pet-related questions are sent to OpenAI's API for advice</li>
                  <li>We do not share your email, location, or sensitive data in those requests</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Analytics (Mixpanel):</h3>
                <p className="text-muted-foreground">
                  Feature usage tracking exists in the codebase but is currently disabled in production
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use the Data</h2>
            <p className="text-muted-foreground mb-4">We use your data to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Authenticate and manage your user account</li>
              <li>Show content and location-based features when opted in</li>
              <li>Allow interaction with other pets and users</li>
              <li>Enable pet profile search via usernames</li>
              <li>Power community features: sitter bookings, groups, deals, and events</li>
              <li>Improve your experience with in-app tools such as AI Paw Coach</li>
            </ul>
            <p className="text-foreground font-medium mt-4">
              No ads, no third-party data sales
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Data Storage & Security</h2>
            <p className="text-muted-foreground mb-4">
              All data is securely stored on Supabase:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Encrypted in transit (TLS/HTTPS)</li>
              <li>Encrypted at rest (AES‑256)</li>
              <li>Passwords are hashed using bcrypt</li>
              <li>Row-level security (RLS) ensures user-specific access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Your Rights and Controls</h2>
            <p className="text-muted-foreground mb-4">You can:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Set your profile to Private to limit visibility to friends only</li>
              <li>Revoke location access via your device or toggle "Ready to Play" OFF</li>
              <li>Delete your own:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Pet tweets 🐾</li>
                  <li>Pet adventures 🌍</li>
                  <li>Uploaded pet photos</li>
                  <li>Entire pet profiles</li>
                </ul>
              </li>
              <li>Fully delete your account and data from:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>⚙️ Settings page in the app, or</li>
                  <li>🌐 pawcultapp.com/delete-account</li>
                </ul>
              </li>
            </ul>
            <p className="text-muted-foreground mt-4">
              📧 For data-related questions: <a href="mailto:info.pawcult@gmail.com" className="text-primary hover:underline">info.pawcult@gmail.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Children's Privacy</h2>
            <p className="text-muted-foreground">
              Pawcult is not intended for users under the age of 13. We do not knowingly collect data from minors.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              Any updates will be posted on: <a href="https://pawcultapp.com/privacy" className="text-primary hover:underline">https://pawcultapp.com/privacy</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Contact Us</h2>
            <p className="text-muted-foreground">
              📧 <a href="mailto:info.pawcult@gmail.com" className="text-primary hover:underline">info.pawcult@gmail.com</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;