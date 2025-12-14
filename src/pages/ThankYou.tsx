import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy } from "lucide-react";
import Footer from "@/components/Footer";

const LogoMark = () => (
  <svg
    viewBox="0 0 72 55"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-auto drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]"
  >
    <path
      d="M35.1375 54.8993C35.0844 55.8883 32.5205 49.348 31.3059 46.0832C30.7393 44.5589 36.4796 44.8638 38.059 44.4916C43.6789 43.1622 55.2446 38.3589 56.4097 21.2373C56.9727 12.96 47.7159 9.45769 47.7974 5.56189C47.9143 1.0616e-06 55.6802 0.127614 55.6802 0.127614L69.3741 0C71.2723 0.0460832 72.5223 1.98867 71.7857 3.73983L50.9491 53.2438C50.5277 54.2435 49.5503 54.8922 48.4667 54.8922H35.1375V54.8993Z"
      fill="white"
    />
    <path
      d="M16.1494 4.20421L37.6163 51.4359C38.3635 53.0807 37.0604 54.8993 35.1339 54.8993H24.8396C23.7559 54.8993 22.7786 54.2966 22.3572 53.375L1.23368 4.20421"
      fill="white"
    />
    <path
      d="M23.4124 53.5274L0.213799 4.07659C-0.533402 2.38215 0.769773 0.506915 2.69621 0.506915H12.9906C14.0742 0.506915 15.0516 1.12727 15.473 2.08083L37.8324 52.7582"
      fill="white"
    />
  </svg>
);

const ThankYou = () => {
  const [copied, setCopied] = useState(false);
  const waitlistUrl = window.location.origin + "/waitlist";
  const shareText = "Join me on the Viola waitlist - the future of AI-powered music discovery!";

  const handleCopy = () => {
    navigator.clipboard.writeText(waitlistUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSocialShare = (platform: string) => {
    let shareUrl = "";
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(waitlistUrl);

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      {/* Header with Logo */}
      <header className="bg-black relative z-50">
        <div className="flex items-center px-6 py-8">
          <LogoMark />
        </div>
      </header>

      {/* Thank You Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Thanks for submitting!
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              We hope you'll help us plant more violas
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Share with friends</h2>

            {/* Copy Link */}
            <div className="mb-6">
              <label className="text-sm text-muted-foreground mb-2 block">
                Copy waitlist link
              </label>
              <div className="flex gap-2">
                <Input
                  value={waitlistUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  onClick={handleCopy}
                  className="bg-[#e4ea04] text-black hover:bg-[#e4ea04]/90 hover:shadow-[0_0_20px_rgba(228,234,4,0.4),0_0_40px_rgba(228,234,4,0.2)] px-6 transition duration-500"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div>
              <label className="text-sm text-muted-foreground mb-3 block">
                Share on social media
              </label>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => handleSocialShare("twitter")}
                  variant="outline"
                  size="lg"
                  className="flex-1 max-w-[150px]"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Twitter
                </Button>
                <Button
                  onClick={() => handleSocialShare("linkedin")}
                  variant="outline"
                  size="lg"
                  className="flex-1 max-w-[150px]"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </Button>
                <Button
                  onClick={() => handleSocialShare("facebook")}
                  variant="outline"
                  size="lg"
                  className="flex-1 max-w-[150px]"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                  Facebook
                </Button>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            We'll notify you when Viola launches. Stay tuned!
          </p>
        </div>
      </main>

      <Footer animated={false} showCTA={false} />
    </div>
  );
};

export default ThankYou;
