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
              Pawcult("We") is a social application developed with Lovable.dev and powered by Supabase. 
              This Privacy Policy outlines what data we collect, how we use it, and your rights regarding your personal information.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. What Data We Collect</h2>
              <p className="text-muted-foreground mb-4">
                We collect and process the following information from users:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Email address & password:</h3>
                  <p className="text-muted-foreground">
                    Required for secure login and account creation. No third-party login options (e.g. Google, Facebook) are used.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Location data:</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Asked at login</li>
                    <li>Asked again on the Pet Map screen</li>
                    <li>Only shared when the user toggles "Ready to Play" ON</li>
                    <li>When toggled OFF, location tracking and storage stop</li>
                    <li>The device permission stays active until manually revoked via settings</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Photos & media:</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Users can upload pet profile images and share pet tweets with optional media</li>
                    <li>These images are user-selected; the app does not access your full media library</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Pet profiles & social features:</h3>
                  <p className="text-muted-foreground">
                    Public pet profiles, likes, comments, group packs, events, sitter bookings, and business accounts are visible to other users inside the app.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">AI Paw Coach:</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>This feature sends your question text to OpenAI's API for pet care suggestions</li>
                    <li>No personal identifiers (email, password, or location) are included in the request</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Analytics (Mixpanel):</h3>
                  <p className="text-muted-foreground">
                    Our app includes optional analytics for feature usage (e.g. "Pet Profile Created"), but tracking is currently disabled in production.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use the Data</h2>
              <p className="text-muted-foreground mb-4">Your data is used to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Authenticate and manage your account</li>
                <li>Show pets and events based on your location (when enabled)</li>
                <li>Allow posting, commenting, liking, and exploring other pets</li>
                <li>Connect users with sitters, businesses, and community groups</li>
                <li>Provide tailored pet tips via AI Paw Coach</li>
                <li>Improve app features and engagement based on usage data (only if analytics are enabled)</li>
              </ul>
              <p className="text-muted-foreground mt-4 font-medium">
                We do not show ads, do not share your data with third parties, and do not sell any user data.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Data Storage & Security</h2>
              <p className="text-muted-foreground mb-4">
                All user data is securely stored on Supabase infrastructure:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Communication is encrypted via TLS (HTTPS)</li>
                <li>Data at rest is encrypted using AES‑256</li>
                <li>Passwords are hashed using bcrypt</li>
                <li>Supabase applies strict row-level security (RLS) to restrict data access per user</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                We follow modern security best practices.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Your Controls and Rights</h2>
              <p className="text-muted-foreground mb-4">You can:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Turn off location sharing via the "Ready to Play" toggle</li>
                <li>Revoke location permissions from your device settings</li>
                <li>Delete any uploaded photo or pet tweet within the app</li>
                <li>Request full account deletion via email</li>
              </ul>
              <div className="bg-muted p-4 rounded-lg mt-4">
                <p className="text-foreground font-medium">📧 For removal requests: support@pawcultapp.com</p>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Pawcult is not intended for children under 13. We do not knowingly collect data from minors.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Changes to This Policy</h2>
              <p className="text-muted-foreground mb-2">
                We may update this policy as features evolve. The latest version will always be available at:
              </p>
              <div className="bg-muted p-3 rounded-lg">
                <code className="text-primary">https://pawcultapp.com/privacy</code>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Contact Us</h2>
              <p className="text-muted-foreground mb-2">
                For privacy-related inquiries, contact:
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