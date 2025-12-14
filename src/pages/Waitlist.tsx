import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Footer from "@/components/Footer";
import AnimatedVLogo from "@/components/AnimatedVLogo";

const LogoMark = () => (
  <svg
    viewBox="0 0 72 55"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-auto drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]"
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

const Waitlist = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    relation: "",
    favoriteSong: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Replace with your Google Sheets API endpoint
      await fetch("https://script.google.com/macros/s/AKfycbyjHUI0iZT3TWzlizAbsAqmUOPI8ECh88DmGvAF8o5xULlnIv0Setkx02TCVYUDD4Jp/exec", {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Navigate to thank you page
      navigate("/thank-you");
    } catch (error) {
      console.error("Error submitting form:", error);
      // Still navigate even if there's an error (since no-cors doesn't give us response status)
      navigate("/thank-you");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      
      {/* Form Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 pt-24">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="flex justify-center mb-8 py-4">
              <AnimatedVLogo />
            </div>

            <h1 className="font-zen text-3xl md:text-4xl font-bold mb-3 text-white">Join the Waitlist</h1>
            <p className="font-dm text-white/80">
              Be among the first to experience the future of music discovery
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-white font-medium">
                First Name <span className="text-[#e4ea04]">*</span>
              </Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="John"
                className="w-full bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#e4ea04] focus:ring-[#e4ea04]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-white font-medium">
                Last Name <span className="text-[#e4ea04]">*</span>
              </Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Doe"
                className="w-full bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#e4ea04] focus:ring-[#e4ea04]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white font-medium">
                Email <span className="text-[#e4ea04]">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                className="w-full bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#e4ea04] focus:ring-[#e4ea04]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relation" className="text-white font-medium">
                Relation to the Music Industry <span className="text-[#e4ea04]">*</span>
              </Label>
              <Input
                id="relation"
                name="relation"
                type="text"
                required
                value={formData.relation}
                onChange={handleInputChange}
                placeholder="e.g., Music Supervisor, Curator, Producer"
                className="w-full bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#e4ea04] focus:ring-[#e4ea04]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="favoriteSong" className="text-white font-medium">
                Favorite Song <span className="text-[#e4ea04]">*</span>
              </Label>
              <Textarea
                id="favoriteSong"
                name="favoriteSong"
                required
                value={formData.favoriteSong}
                onChange={handleInputChange}
                placeholder="Artist - Song Title"
                className="w-full resize-none bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#e4ea04] focus:ring-[#e4ea04]"
                rows={2}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#e4ea04] text-black hover:bg-[#e4ea04]/90 hover:shadow-[0_0_20px_rgba(228,234,4,0.4),0_0_40px_rgba(228,234,4,0.2)] py-6 text-lg font-medium transition duration-500"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </div>
      </main>

      <Footer animated={false} showCTA={true} />
    </div>
  );
};

export default Waitlist;
