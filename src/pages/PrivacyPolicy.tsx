import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary">
              Privacy Policy for Pawcult
            </CardTitle>
            <p className="text-muted-foreground mt-4">
              Pawcult ("we", "our", or "the app") is a social application developed with Lovable.dev and powered by Supabase. 
              This Privacy Policy outlines what data we collect, how we use it, and your rights regarding your personal information.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. What Data We Collect</h2>
              <p className="text-muted-foreground mb-4">
                We collect and process the following data from users:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Email address & password:</h3>
                  <p className="text-muted-foreground">
                    Required for secure login and account creation. We do not use third-party login methods (e.g., Google, Facebook).
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Location data:</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Requested at login and again on the Pet Map screen</li>
                    <li>Only stored and shared when the user toggles "Ready to Play" ON</li>
                    <li>When OFF, location tracking and storage stop</li>
                    <li>Permission remains active until manually revoked via device settings</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Photos & media:</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Users can upload images for pet profiles or pet tweets</li>
                    <li>Only files explicitly selected by the user are accessed</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Pet profiles:</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Users can create public or private pet profiles, including pet usernames</li>
                    <li>Users can search for others via pet usernames to send friend requests</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Activity visibility:</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Users can set their profile to "Private"</li>
                    <li>If private, your activities (tweets, pet profiles, events, and appearance in Discover) are only visible to accepted friends</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">App features used:</h3>
                  <p className="text-muted-foreground">
                    Events, pet sitters, businesses, deals, groups ("packs"), likes, comments
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">AI Paw Coach:</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Sends pet-related questions to OpenAI</li>
                    <li>No sensitive personal data (like email or password) is transmitted</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Analytics (Mixpanel):</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>The app contains code for feature usage tracking (e.g., "Pet Profile Created")</li>
                    <li>Tracking is currently disabled in production</li>
                  </ul>
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use the Data</h2>
              <p className="text-muted-foreground mb-4">Your data is used to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Authenticate and manage your account</li>
                <li>Enable map features and location-based visibility (when opted in)</li>
                <li>Display pet profiles and pet tweets (according to privacy settings)</li>
                <li>Allow sending and receiving of friend requests via pet usernames</li>
                <li>Support events, sitter bookings, business listings, and discount deals</li>
                <li>Power AI Paw Coach responses based on your input</li>
                <li>Improve feature usage (analytics disabled by default)</li>
              </ul>
              <p className="text-muted-foreground mt-4 font-medium">
                We do not serve ads, do not sell your data, and do not share it with third parties.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Data Storage & Security</h2>
              <p className="text-muted-foreground mb-4">
                All user data is stored using Supabase's secure infrastructure:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Communication is encrypted (TLS/HTTPS)</li>
                <li>Data at rest is encrypted (AES‑256)</li>
                <li>Passwords are securely hashed with bcrypt</li>
                <li>Row-level security (RLS) ensures users only access their own data</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Your Rights and Controls</h2>
              <p className="text-muted-foreground mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Toggle "Ready to Play" OFF to stop sharing your location</li>
                <li>Revoke app location permission from device settings</li>
                <li>Delete or edit uploaded photos and tweets anytime</li>
                <li>Set your profile to "Private" to limit visibility to friends only</li>
                <li>Delete your account and associated data directly from the app or by contacting us</li>
              </ul>
              <div className="bg-muted p-4 rounded-lg mt-4">
                <p className="text-foreground font-medium">📧 To request account deletion or for privacy inquiries:</p>
                <p className="text-foreground font-medium">info.pawcult@gmail.com</p>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Pawcult is not intended for users under the age of 13. We do not knowingly collect data from minors.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Updates to This Policy</h2>
              <p className="text-muted-foreground mb-2">
                We may update this policy from time to time. All changes will be published on:
              </p>
              <div className="bg-muted p-3 rounded-lg">
                <code className="text-primary">https://pawcultapp.com/privacy</code>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Contact Us</h2>
              <p className="text-muted-foreground mb-2">
                For privacy-related questions or feedback:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-foreground font-medium">📧 info.pawcult@gmail.com</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;