import { useNavigate } from "react-router-dom";
import { useState, useRef, MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Cog, Star, Users, CheckCircle2 } from "lucide-react";
import Footer from "@/components/Footer";


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

const phrases = [
  "you didn't get into this for spreadsheets",
  "your ears deserve a weekend",
  "built for tastemakers, not button-pushers",
  "the fun part, back"
];

const Landing = () => {
  const navigate = useNavigate();
  const [randomPhrase] = useState(() => phrases[Math.floor(Math.random() * phrases.length)]);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const [backgroundTransform, setBackgroundTransform] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>, index: number) => {
    const button = buttonRefs.current[index];
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    button.style.setProperty('--mouse-x', `${x}px`);
    button.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleJoinWaitlist = () => {
    navigate("/waitlist");
  };

  const handleBackgroundMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!backgroundRef.current) return;

    const rect = backgroundRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate distance from center, normalized to -1 to 1
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);

    // Apply subtle movement (max 20px in each direction for the background)
    const moveX = deltaX * 20;
    const moveY = deltaY * 20;

    setBackgroundTransform({ x: moveX, y: moveY });
  };

  const handleBackgroundMouseLeave = () => {
    setBackgroundTransform({ x: 0, y: 0 });
  };

  return (
    <div className="min-h-screen bg-black font-inter">
      {/* Navigation */}
      <nav className="absolute z-50 w-full">
        <div className="flex items-center px-6 py-8 lg:justify-between justify-center">
          <div className="flex items-center gap-6">
            <LogoMark />
          </div>
          <div>
            <Button
              ref={(el) => (buttonRefs.current[0] = el)}
              onMouseMove={(e) => handleMouseMove(e, 0)}
              onClick={handleJoinWaitlist}
              className="
              hidden
              lg:inline-flex lg:items-center
              group relative transition duration-500
              ease-in-out hover:cursor-pointer rounded-2xl border
              border-white px-6 py-2 font-medium bg-transparent min-w-[150px]
              hover:border-[#e4ea04] hover:text-black hover:bg-[#e4ea04] overflow-hidden
              before:absolute before:inset-0 before:rounded-2xl before:opacity-0
              hover:before:opacity-100 before:transition-opacity before:duration-300
              before:bg-[radial-gradient(circle_80px_at_var(--mouse-x)_var(--mouse-y),rgba(228,234,4,0.15),transparent)]"
            >
              <span className="relative z-10">Join the waitlist</span>
              <ArrowRight className="w-4 h-4 ml-2 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center content-center justify-center px-2 lg:px-8 pt-20 md:pt-32 overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute lg:rounded-full invert top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-[25px] sm:w-full lg:w-3/4 h-1/2 h-auto object-cover z-2 opacity-90
           "
        >
          <source src="/viola_background.mp4" type="video/mp4" />
        </video>

        <div className="
      absolute pointer-events-none -inset-[90%] z-10
      bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_0%,rgba(0,0,0,1)_50%,rgba(255,255,255,0.1)_100%)]
       blur-[40px] opacity-40"></div>

        <div className="text-center font-dm max-w-7xl mx-auto relative z-10">

          <h1 className="font-[500] font-zen drop-shadow-[0px_0px_3px_rgba(255,255,255,1)] text-4xl sm:text-6xl lg:text-7xl font-[500] tracking-tight mb-6 opacity-0 animate-fade-in-up [animation-delay:400ms]">
          from brief to cleared <br></br>track &lt; 30 minutes.
          </h1>

          <p className="text-md md:text-xl mb-12 max-w-3xl text-white/60 mx-auto opacity-0 animate-fade-in-up [animation-delay:600ms]">
          Viola is an AI-powered file management tool to streamline work for the creative music tastemakers. Your taste, your timeline, and your sanity all intact.
          </p>

          <div className="cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in-up [animation-delay:800ms]">
            <Button
              ref={(el) => (buttonRefs.current[1] = el)}
              onMouseMove={(e) => handleMouseMove(e, 1)}
              size="lg"
              className="group relative transition duration-500 text-lg px-8 py-6 bg-white text-black hover:bg-[#e4ea04]/90 hover:shadow-[0_0_20px_rgba(228,234,4,0.5),0_0_40px_rgba(228,234,4,0.2)] overflow-hidden before:absolute before:inset-0 before:rounded-md before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:bg-[radial-gradient(circle_100px_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.2),transparent)]"
              onClick={handleJoinWaitlist}
            >
              <span className="relative z-10">Join the waitlist</span>
              <ArrowRight className="w-5 h-5 ml-2 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Credibility Section */}
      <section className="px-4 md:px-8 lg:px-24 lg:py-10">
        <div className="max-w-5xl mx-auto">

          <div className="relative overflow-hidden rounded-2xl border border-white/10 px-6 md:px-10 py-10 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-[#e4ea04]/10 pointer-events-none"></div>
            <div className="absolute -left-1 top-8 bottom-8 w-1 bg-gradient-to-b from-[#e4ea04] via-white/50 to-transparent rounded-full opacity-80"></div>
            <p className="relative font-zen text-xl md:text-2xl lg:text-3xl leading-relaxed text-white">
              This sounds like an incredible tool... A reliable AI metadata tagging system would truly be a game changer for the industry — imagine being able to search every sync placement around the world in seconds. That's the future.
            </p>

            <div className="relative mt-6 flex items-center gap-3 text-sm md:text-base text-white/70">
              <div className="h-px w-10 bg-[#e4ea04]"></div>
              <p className="font-dm">Michael Chen · Film & TV @ Sony Music Publishing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <div
        className="px-4 md:px-8 lg:px-12 py-8 md:py-12 lg:py-24"
        onMouseMove={handleBackgroundMouseMove}
        onMouseLeave={handleBackgroundMouseLeave}
      >
        <div className="relative">
          {/* Blurred background image acting as border */}
          <div
            ref={backgroundRef}
            className="absolute bg-center saturate-[2] blur-lg scale-110 opacity-50 inset-0 rounded-xl md:rounded-2xl bg-cover transition-transform duration-500 animate-heatwave ease-out"
            style={{
              backgroundImage: 'url(viola.jpg)',
              backgroundSize: "300% 300%",
              transform: `translate(${backgroundTransform.x}px, ${backgroundTransform.y}px)`
            }}
          ></div>

          {/* Main content container */}
          <div className="relative bg-black/90 rounded-xl md:rounded-2xl m-2 md:m-3">
            <div className="flex flex-col lg:flex-row items-center gap-6 md:gap-8 lg:gap-12 px-4 py-8 md:px-8 md:py-12 lg:px-12 lg:py-16">
              <div className="w-full lg:flex-[2] lg:max-w-2xl px-4 lg:pb-10">
                <div className="inline-flex gap-2 px-3 py-2 md:px-4 rounded-full bg-white text-black mb-6 md:mb-8 lg:mb-12 ring-1 ring-white/30">
                  <Target className="w-4 h-4" />
                  <span className="text-xs md:text-sm font-medium">The Problem</span>
                </div>
                <h2 className="font-zen text-xl md:text-3xl lg:text-5xl font-bold mb-4 md:mb-6 lg:mb-12 text-white leading-tight">
                  For tastemakers drowning in tracks, not short on taste.
                </h2>
                <div className="text-white/90 space-y-4 md:space-y-2">
                  <p className="text-base md:text-lg">
                    If you work in sync, you already know the drill
                  </p>

                  <ul className="list-disc pl-5 md:pl-6 space-y-1 md:space-y-2 lg:space-y-5">
                    <li className="text-sm md:text-base lg:text-lg">40,000 tracks. One placement. Do the math.</li>
                    <li className="text-sm md:text-base lg:text-lg">
                      &quot;That perfect cue&quot; is out there. So are the next 47 hours of your life.
                    </li>
                    <li className="text-sm md:text-base lg:text-lg">
                      Spreadsheets to find it. Emails to clear it. Prayers to ship it.
                    </li>
                  </ul>

                  <p className="text-sm md:text-base pt-2 md:pt-3">
                    You weren&apos;t hired to tolerate busywork. You were hired because you know the song
                    before you hear it. <span className="font-zen">viola</span> gives you supplies you need to paint your vision.
                  </p>

                  
                </div>
              </div>
              <div className="relative w-full lg:flex-1 flex justify-center mt-4 lg:mt-0 lg:self-stretch overflow-hidden px-4 md:px-2">
                <img
                  src="needle_haystack.png"
                  alt="Looking for perfect tracks can be like finding a needle in a haystack."
                  className="w-full h-52 lg:h-full object-cover rounded-2xl saturate-[0] contrast-[1.2]"
                />
                <div className="absolute cursor-pointer flex flex-col sm:flex-row bottom-0 left-6 justify-self-center py-6">
                    <Button
                      ref={(el) => (buttonRefs.current[1] = el)}
                      onMouseMove={(e) => handleMouseMove(e, 1)}
                      size="lg"
                      className="group relative transition duration-500 text-lg px-8 py-6 bg-white text-black hover:bg-[#e4ea04]/90 hover:shadow-[0_0_20px_rgba(228,234,4,0.5),0_0_40px_rgba(228,234,4,0.2)] overflow-hidden before:absolute before:inset-0 before:rounded-md before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:bg-[radial-gradient(circle_100px_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.2),transparent)]"
                      onClick={handleJoinWaitlist}
                    >
                      <span className="relative z-10">Join us</span>
                      <ArrowRight className="w-5 h-5 ml-2 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Callout Section */}
      <section className="py-12 md:py-16 lg:py-24">
        <div className="relative w-full min-h-[200px] md:min-h-[250px] lg:min-h-[300px] overflow-hidden flex items-center justify-center">
          {/* Blurred background with heatwave animation */}
          <div
            className="absolute inset-0 bg-center saturate-[2] blur-lg scale-110 animate-heatwave"
            style={{
              backgroundImage: 'url(viola.jpg)',
            }}
          ></div>

          {/* Dark overlay for better text contrast */}
          <div className="absolute inset-0 bg-white/10 blur-md"></div>

          {/* Content */}
          <div className="relative z-10 px-6 md:px-12 py-12 md:py-16 lg:py-20">
            <h2 className="font-dm font-bold text-2xl md:text-4xl lg:text-5xl text-center text-white leading-tight max-w-5xl">
              From <span className="italic font-zen">"I'll Know It When I Hear It"</span>
              <br className="hidden md:block" />
              <span className="md:inline block mt-2 md:mt-0 font-dm"> to Cleared.</span> <span className="italic font-zen">One Place.</span>
            </h2>
          </div>
        </div>
      </section>

      <div className="px-4 md:px-8 lg:px-24 ">
        {/* Feature Section 1: Locate */}
        <section className="py-12 md:py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-16">
            {/* Animation - Left */}
            <div className="w-full lg:flex-1 flex justify-center">
              <video
              autoPlay
              loop
              muted
              playsInline
              className="animate-fade-in-up
              "
            >
              <source src="/violaSearch.mov" type="video/mp4" />
            </video>
            </div>

            {/* Text - Right */}
            <div className="w-full lg:flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e4ea04]/10 text-[#e4ea04] mb-6 ring-1 ring-[#e4ea04]">
                <Target className="w-4 h-4" />
                <span className="text-sm font-medium">AI Search</span>
              </div>
              <h2 className="font-zen text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
                Find the perfect track in seconds
              </h2>
              <p className="text-base md:text-lg text-white/80 mb-4">
              Type what you’d say in the spotting session: “dark and eerie song while the lead girl and boy are being chased, subtle vocal, no explicit lyrics.” Viola understands mood, genre, era, references, and story context.
              No more blind keyword guessing or endless scroll. Just say what you need, and Viola pulls the tracks that actually feel right.            </p>
            </div>
          </div>
        </section>

        {/* Feature Section 2: Listen */}
        <section className="py-12 md:py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-8 md:gap-12 lg:gap-16">
            {/* Animation - Right */}
            <div className="w-full lg:flex-1 flex justify-center">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="animate-fade-in-up
                "
              >
                <source src="/violaPitchBuilder.mov" type="video/mp4" />
              </video>
            </div>

            {/* Text - Left */}
            <div className="w-full lg:flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e4ea04]/10 text-[#e4ea04] mb-6 ring-1 ring-[#e4ea04]">
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">Pitch Builder</span>
              </div>
              <h2 className="font-zen text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
                Curate with confidence
              </h2>
              <p className="text-base md:text-lg text-white/80 mb-4">
                Build playlists by show, episode, or game level. Save favorites, versions, and alternates without losing the thread. Viola tracks what you’ve tried, what’s in contention, and what’s been killed so you don’t have to.
                Smart curation tools surface patterns in your taste, so each pass gets sharper instead of starting from zero.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Section 3: License */}
        <section className="py-12 md:py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-16">
            {/* Animation - Left */}
            <div className="w-full lg:flex-1 flex justify-center">
              <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="animate-fade-in-up
                  "
                >
                <source src="/violaCatalogue.mov" type="video/mp4" />
              </video>
            </div>

            {/* Text - Right */}
            <div className="w-full lg:flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e4ea04]/10 text-[#e4ea04] mb-6 ring-1 ring-[#e4ea04]">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">Upload Your Entire Catalog in One Place</span>
              </div>
              <h2 className="font-zen text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
                Clear tracks faster than ever
              </h2>
              <p className="text-base md:text-lg text-white/80 mb-4">
                Your entire catalog in one place. When a track hits, everything you need to clear it is already there: usage, rights info, and context in one place. Request terms, track status, and keep the paper trail tied to the project instead of buried in email.
                From first listen to licensed cue, Viola keeps you in one workspace.
              </p>
              
            </div>
          </div>
        </section>
      </div>

      {/* How It Works Section */}
      <section className="px-6 py-24 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Cog className="w-4 h-4" />
              <span className="text-sm font-medium">How It Works</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Three simple steps to better music discovery
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Describe what you need</h3>
              <p className="text-muted-foreground">
                Use natural language to search for music. "Upbeat indie rock for a car commercial" or "melancholic piano for a dramatic scene"
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Discover & curate</h3>
              <p className="text-muted-foreground">
                Browse AI-powered results that match your criteria. Save favorites, create playlists, and organize your finds
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Build pitches instantly</h3>
              <p className="text-muted-foreground">
                Generate professional music pitches with AI assistance. Include context, mood boards, and compelling narratives
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiation Section */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">What Makes Us Different</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Built specifically for music professionals
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 rounded-xl bg-card border border-border">
              <CheckCircle2 className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Natural Language Search</h3>
              <p className="text-muted-foreground">
                No more keyword guessing. Describe exactly what you're looking for in plain English
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border">
              <CheckCircle2 className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">AI-Powered Pitching</h3>
              <p className="text-muted-foreground">
                Generate compelling music pitches that save you hours of writing and formatting
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border">
              <CheckCircle2 className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Smart Curation</h3>
              <p className="text-muted-foreground">
                Organize and manage your music library with intelligent tagging and categorization
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border">
              <CheckCircle2 className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Built for Professionals</h3>
              <p className="text-muted-foreground">
                Designed by music industry veterans for music supervisors, curators, and tastemakers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="px-6 py-24 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Trusted by Professionals</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Join music industry professionals already on the waitlist
            </h2>
            <p className="text-lg text-muted-foreground">
              Music supervisors, curators, and tastemakers are excited about the future of music discovery
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">Early adopters</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <p className="text-muted-foreground">Music supervisors</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <p className="text-muted-foreground">Excited for launch</p>
            </div>
          </div>
        </div>
      </section>

      <Footer animated={true} showCTA={true} />
    </div>
  );
};

export default Landing;
