import { Share, Plus, MoreVertical, Download, Smartphone } from 'lucide-react';

const PWAInstallInstructions = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-background to-muted">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            🔵 Get PawCult on Your Phone
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enjoy the best experience by installing PawCult on your phone.
            No app store needed for iPhone – and Android app is now in beta!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* iOS Instructions */}
          <div className="bg-card rounded-2xl p-6 shadow-lg border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">🍏 iPhone & iPad</h3>
                <p className="text-sm text-muted-foreground">(Web version – App Store version coming soon)</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-semibold text-primary">1</span>
                </div>
                <div className="flex items-center gap-3">
                  <Share className="w-5 h-5 text-blue-500" />
                  <p className="text-sm text-foreground">Tap the "Share" icon in your browser</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-semibold text-primary">2</span>
                </div>
                <div className="flex items-center gap-3">
                  <Plus className="w-5 h-5 text-green-500" />
                  <p className="text-sm text-foreground">Scroll down and tap "Add to Home Screen"</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-semibold text-primary">3</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-blue-500 rounded text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                  <p className="text-sm text-foreground">Tap "Add" to confirm</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                📌 Our iOS app is on the way. Until then, enjoy the full experience in your browser!
              </p>
            </div>
          </div>

          {/* Android Instructions */}
          <div className="bg-card rounded-2xl p-6 shadow-lg border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">🤖 Android</h3>
                <p className="text-sm text-muted-foreground">(Beta version now available on Google Play)</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-semibold text-primary">1</span>
                </div>
                <div>
                  <p className="text-sm text-foreground">
                    <a 
                      href="https://play.google.com/store/apps/details?id=com.pawcultapp" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Join the Beta Test on Google Play
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-semibold text-primary">2</span>
                </div>
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-green-500" />
                  <p className="text-sm text-foreground">Install the app and explore PawCult on mobile</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-muted-foreground mb-3">Or, use the web version as a shortcut:</p>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-semibold text-secondary">1</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                      <p className="text-sm text-foreground">Tap the three dots in Chrome</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-semibold text-secondary">2</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Download className="w-5 h-5 text-green-500" />
                      <p className="text-sm text-foreground">Tap "Install app" or "Add to Home screen"</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-semibold text-secondary">3</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-500 rounded text-white flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                      <p className="text-sm text-foreground">Follow the on-screen instructions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Once installed, the app will work just like a native app with offline capabilities!
          </p>
        </div>
      </div>
    </section>
  );
};

export default PWAInstallInstructions;