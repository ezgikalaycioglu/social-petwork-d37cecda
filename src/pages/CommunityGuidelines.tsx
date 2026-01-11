import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Shield, Users, Camera, MessageCircle, Flag, AlertTriangle } from 'lucide-react';

const CommunityGuidelines = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-4 rounded-full">
                <Shield className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Community Guidelines
            </h1>
            <p className="text-gray-600">
              Building a safe, positive community for pets and their families
            </p>
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-8">
              Welcome to PawCult! Our mission is to create a warm, supportive community where pet parents 
              can connect, share experiences, and build lasting friendships — for themselves and their furry companions. 
              To keep our community safe and enjoyable for everyone, please follow these guidelines.
            </p>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-pink-100 p-2 rounded-lg">
                  <Heart className="h-5 w-5 text-pink-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 m-0">1. Be Respectful & Kind</h2>
              </div>
              <ul className="text-gray-600 space-y-2 list-disc pl-6">
                <li>Treat all members with kindness, empathy, and respect</li>
                <li>Celebrate diversity — pets and their families come in all shapes, sizes, and backgrounds</li>
                <li>No harassment, bullying, hate speech, or discrimination of any kind</li>
                <li>Constructive feedback is welcome; personal attacks are not</li>
              </ul>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 m-0">2. Pet Safety First</h2>
              </div>
              <ul className="text-gray-600 space-y-2 list-disc pl-6">
                <li>Always prioritize the health, safety, and well-being of all pets</li>
                <li>Never share content that shows or encourages animal harm or neglect</li>
                <li>When arranging playdates or meetups, ensure a safe environment for all animals</li>
                <li>Respect each pet's boundaries and temperament</li>
              </ul>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Camera className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 m-0">3. Appropriate Content Only</h2>
              </div>
              <ul className="text-gray-600 space-y-2 list-disc pl-6">
                <li>Share content that's family-friendly and pet-focused</li>
                <li>No explicit, violent, or disturbing imagery</li>
                <li>No misleading information or impersonation</li>
                <li>Keep posts relevant to pets, pet parenting, and community activities</li>
              </ul>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 m-0">4. Privacy & Consent</h2>
              </div>
              <ul className="text-gray-600 space-y-2 list-disc pl-6">
                <li>Respect other members' privacy — don't share personal information without permission</li>
                <li>Get consent before posting photos that include other people or their pets</li>
                <li>Use location sharing features responsibly</li>
                <li>Report any suspicious activity or potential privacy violations</li>
              </ul>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 m-0">5. No Spam or Commercial Abuse</h2>
              </div>
              <ul className="text-gray-600 space-y-2 list-disc pl-6">
                <li>Don't spam or send unsolicited promotional messages</li>
                <li>Commercial promotions should be relevant and through proper channels</li>
                <li>No scams, fraudulent schemes, or misleading business practices</li>
                <li>If you're a pet business, be transparent about your commercial intentions</li>
              </ul>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Flag className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 m-0">6. Reporting & Moderation</h2>
              </div>
              <ul className="text-gray-600 space-y-2 list-disc pl-6">
                <li>If you see content that violates these guidelines, please report it</li>
                <li>Use the in-app report feature for quick action</li>
                <li>Our moderation team reviews reports promptly and fairly</li>
                <li>False or malicious reports are also a violation of these guidelines</li>
              </ul>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 m-0">7. Consequences of Violations</h2>
              </div>
              <p className="text-gray-600 mb-3">
                Violations of these guidelines may result in:
              </p>
              <ul className="text-gray-600 space-y-2 list-disc pl-6">
                <li><strong>Warning:</strong> First-time or minor violations</li>
                <li><strong>Temporary Suspension:</strong> Repeated or more serious violations</li>
                <li><strong>Permanent Ban:</strong> Severe violations or continued misconduct</li>
              </ul>
              <p className="text-gray-600 mt-3">
                We reserve the right to remove content and accounts that violate these guidelines at our discretion.
              </p>
            </section>

            <section className="bg-green-50 rounded-xl p-6 mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Questions or Concerns?</h2>
              <p className="text-gray-600 mb-4">
                If you have questions about these guidelines or need to report an issue, 
                please reach out to us. We're here to help!
              </p>
              <Button
                onClick={() => navigate('/contact')}
                className="bg-green-600 hover:bg-green-700"
              >
                Contact Us
              </Button>
            </section>

            <p className="text-gray-500 text-sm mt-8 text-center">
              Last updated: January 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityGuidelines;
