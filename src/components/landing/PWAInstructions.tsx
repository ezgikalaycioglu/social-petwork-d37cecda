import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Share, Plus, MoreHorizontal } from 'lucide-react';

const PWAInstructions = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Get the App Experience
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Add Social Petwork to your home screen for quick access and a native app experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* iOS Instructions */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">
                iPhone & iPad (Safari)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Share className="w-6 h-6 text-blue-500" />
                  <p className="text-gray-700">Tap the <strong>Share</strong> icon in Safari</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">2</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Plus className="w-6 h-6 text-green-500" />
                  <p className="text-gray-700">Scroll down and tap <strong>"Add to Home Screen"</strong></p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">3</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-orange-500 rounded text-white flex items-center justify-center text-xs font-bold">✓</div>
                  <p className="text-gray-700">Tap <strong>"Add"</strong> to confirm</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Android Instructions */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Android (Chrome)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-sm">1</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MoreHorizontal className="w-6 h-6 text-gray-600" />
                  <p className="text-gray-700">Tap the <strong>three dots</strong> menu in Chrome</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-sm">2</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Plus className="w-6 h-6 text-blue-500" />
                  <p className="text-gray-700">Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-sm">3</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-orange-500 rounded text-white flex items-center justify-center text-xs font-bold">✓</div>
                  <p className="text-gray-700">Follow the on-screen prompts to install</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Once installed, you'll have a Social Petwork icon on your home screen that opens like a native app!
          </p>
        </div>
      </div>
    </section>
  );
};

export default PWAInstructions;