import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Beta = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // SEO tags for SPA
  useEffect(() => {
    const title = "PawCult Beta Sign-up – Become a PawCult Pioneer";
    const description =
      "Join the PawCult beta and help shape the future of pet companionship. Sign up to become a PawCult Pioneer.";
    document.title = title;

    const metaDesc = document.querySelector(
      "meta[name='description']"
    ) as HTMLMetaElement | null;
    if (metaDesc) metaDesc.content = description;

    let canonical = document.querySelector(
      "link[rel='canonical']"
    ) as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}/beta`;

    const ldJson = document.createElement("script");
    ldJson.type = "application/ld+json";
    ldJson.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "PawCult",
      url: `${window.location.origin}/beta`,
      potentialAction: {
        "@type": "SubscribeAction",
        target: `${window.location.origin}/beta`,
        description:
          "Join the PawCult beta to receive early updates and invitations.",
      },
    });
    document.head.appendChild(ldJson);
    return () => {
      document.head.removeChild(ldJson);
    };
  }, []);

  const validateEmail = (val: string) =>
    /[^\s@]+@[^\s@]+\.[^\s@]+/.test(val.trim());

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      // Supabase client is already configured in src/integrations/supabase/client.ts
      // If you need to change the project or keys, update that file.
      const { error } = await supabase
        .from("beta_testers")
        .insert({ email: email.trim() });

      if (error) {
        if (error.code === "23505") {
          // unique violation (already signed up)
          setSuccess(true);
        } else {
          throw error;
        }
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(
        err?.message ||
          "Something went wrong. Please try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-0px)] bg-background">
      <section className="container mx-auto px-6 py-20 md:py-28 flex flex-col items-center text-center">
        <div className="max-w-2xl w-full animate-fade-in">
          <h1 className="font-dm-sans text-4xl md:text-5xl font-bold tracking-tighter leading-tight mb-4">
            Become a PawCult Pioneer.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10">
            Join our exclusive beta program and help us make the world a more fun
            place for pet parents. Your feedback will help shape the future of
            pet companionship!
          </p>

          {!success ? (
            <form
              onSubmit={onSubmit}
              className="mx-auto grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 bg-card p-3 sm:p-4 rounded-2xl shadow-sm border border-border"
              aria-label="PawCult beta sign-up form"
            >
              <label htmlFor="email" className="sr-only">
                Your email address
              </label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                placeholder="Your email address"
                className="h-12 rounded-2xl text-base sm:text-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Button
                type="submit"
                disabled={loading}
                className="h-12 rounded-2xl px-6 font-medium bg-coral text-coral-foreground hover:bg-coral/90 transition-transform duration-200 hover:scale-[1.02] shadow"
              >
                {loading ? "Joining…" : "Join the Beta"}
              </Button>
              {error && (
                <div className="sm:col-span-2 text-destructive text-sm text-left px-1">
                  {error}
                </div>
              )}
              <p className="sm:col-span-2 text-xs text-muted-foreground px-1 mt-1">
                We respect your privacy. Unsubscribe anytime.
              </p>
            </form>
          ) : (
            <div className="bg-accent-light text-foreground border border-accent/30 rounded-2xl p-6 sm:p-8 shadow-sm">
              <p className="text-xl md:text-2xl font-semibold">
                Awesome, you’re on the list! We’ll be in touch soon. 🐾
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Beta;
