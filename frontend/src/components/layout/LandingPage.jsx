import { AuthModal } from "@/components/ui/AuthModal";
import { useState, useEffect } from "react";
import Lenis from "lenis";

function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const handleSignIn = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleGetStarted = () => {
    setAuthMode('register');
    setShowAuthModal(true);
  };

  const handleJoinTeam = () => {
    setAuthMode('register');
    setShowAuthModal(true);
  };

  const handleStartCompeting = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  // Initialize Lenis smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup on unmount
    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div 
      className="bg-[#D9D9D9] text-black"
      style={{ width: '100vw' }}
    >
      {/* Content Container - 80vw */}
      <div 
        className="mx-auto relative"
        style={{ width: '80vw' }}
      >
        {/* First Section - Landing Page */}
        <section className="relative" style={{ height: '90vh' }}>
          {/* Navigation Header */}
          <header className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-8 z-10">
        {/* Logo */}
        <div 
          className="text-black font-bold"
          style={{
            fontSize: 'clamp(20px, 4vw, 36px)',
            fontWeight: '700',
            fontFamily: 'Outreque, sans-serif'
          }}
        >
          CodeBattle
        </div>

        {/* Right Navigation */}
        <div className="flex items-center gap-4 sm:gap-8 lg:gap-10">
          <button
            onClick={handleSignIn}
            className="text-black font-bold hover:opacity-70 transition-opacity"
            style={{
              fontSize: 'clamp(18px, 3.5vw, 36px)',
              fontWeight: '700',
              fontFamily: 'Outreque, sans-serif',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>

          {/* Get Started Free Button - Improved spacing */}
          <button
            onClick={handleGetStarted}
            className="text-black font-bold hover:opacity-90 transition-opacity px-4 sm:px-6 lg:px-8 py-2 sm:py-3 flex items-center justify-center"
            style={{
              minWidth: 'clamp(200px, 25vw, 320px)',
              height: 'clamp(50px, 8vw, 70px)',
              borderRadius: 'clamp(25px, 4vw, 35px)',
              background: '#FF0000',
              color: 'black',
              fontSize: 'clamp(16px, 3vw, 30px)',
              fontWeight: '700',
              fontFamily: 'Outreque, sans-serif',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Get Started Free
          </button>
        </div>
      </header>

      {/* Main Content - Perfectly Centered with Navigation Margin */}
      <main className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6" style={{ marginTop: 'clamp(80px, 12vh, 120px)' }}>
        <div className="w-full max-w-none">
          {/* Main Headline - Massive and Bold */}
          <h1 
            className="text-black font-black leading-tight"
            style={{
              fontSize: 'clamp(60px, 12vw, 160px)',
              fontWeight: '900',
              fontFamily: 'Outreque, sans-serif',
              lineHeight: '0.85',
              marginBottom: 'clamp(20px, 4vw, 40px)'
            }}
          >
            Code & Compete
          </h1>

          {/* Subtitle */}
          <div className="w-full flex justify-center px-2 sm:px-3">
            <p 
              className="text-black leading-relaxed text-center"
              style={{
                fontSize: 'clamp(18px, 4vw, 36px)',
                fontWeight: '500',
                fontFamily: 'Outreque, sans-serif',
                marginBottom: 'clamp(30px, 6vw, 56px)',
                lineHeight: '1.3',
                maxWidth: '100%',
                textAlign: 'center',
                width: '100%'
              }}
            >
              Form your squad, conquer challenges together, and climb the ranks — all synced with your LeetCode streaks.
            </p>
          </div>

          {/* CTA Buttons - Horizontal layout with improved spacing */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 justify-center items-center">
            <button
              onClick={handleJoinTeam}
              className="text-black font-bold hover:opacity-90 transition-opacity px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-center w-full sm:w-auto"
              style={{
                minWidth: 'clamp(200px, 30vw, 260px)',
                height: 'clamp(60px, 10vw, 80px)',
                borderRadius: 'clamp(30px, 5vw, 40px)',
                background: '#FF0000',
                color: 'black',
                fontSize: 'clamp(16px, 3vw, 24px)',
                fontWeight: '700',
                fontFamily: 'Outreque, sans-serif',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Join A Team
            </button>
            <button
              onClick={handleStartCompeting}
              className="text-black font-bold hover:opacity-90 transition-opacity px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-center w-full sm:w-auto"
              style={{
                minWidth: 'clamp(220px, 32vw, 300px)',
                height: 'clamp(60px, 10vw, 80px)',
                borderRadius: 'clamp(30px, 5vw, 40px)',
                background: '#FF0000',
                color: 'black',
                fontSize: 'clamp(16px, 3vw, 24px)',
                fontWeight: '700',
                fontFamily: 'Outreque, sans-serif',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Start Competing
            </button>
          </div>
        </div>
        </main>
        </section>

        {/* Second Section - Assemble & Conquer */}
        <section className="relative flex flex-col items-center justify-center text-center px-4 sm:px-6" style={{ height: '90vh', marginTop: '-10vh' }}>
          <div className="w-full max-w-none">
            {/* Section Headline */}
            <h2 
              className="text-black font-black leading-tight"
              style={{
                fontSize: 'clamp(50px, 10vw, 130px)',
                fontWeight: '900',
                fontFamily: 'Outreque, sans-serif',
                lineHeight: '0.85',
                marginBottom: 'clamp(16px, 3vw, 28px)'
              }}
            >
              Assemble & Conquer
            </h2>

            {/* Section Subtitle */}
            <div className="w-full flex justify-center px-2 sm:px-3">
              <p 
                className="text-black leading-relaxed text-center"
                style={{
                  fontSize: 'clamp(18px, 4vw, 36px)',
                  fontWeight: '500',
                  fontFamily: 'Outreque, sans-serif',
                  marginBottom: 'clamp(30px, 6vw, 56px)',
                  lineHeight: '1.3',
                  maxWidth: '100%',
                  textAlign: 'center',
                  width: '100%'
                }}
              >
                It's more fun together. Invite your friends, challenge each other, and rise to the top.
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center items-center">
              <button
                onClick={handleJoinTeam}
                className="text-black font-bold hover:opacity-90 transition-opacity px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-center w-full sm:w-auto"
                style={{
                  minWidth: 'clamp(200px, 30vw, 260px)',
                  height: 'clamp(60px, 10vw, 80px)',
                  borderRadius: 'clamp(30px, 5vw, 40px)',
                  background: '#FF0000',
                  color: 'black',
                  fontSize: 'clamp(16px, 3vw, 24px)',
                  fontWeight: '700',
                  fontFamily: 'Outreque, sans-serif',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Team Up Now
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative flex justify-center items-center py-6 sm:py-8 z-10 px-4">
          <p 
            className="text-black text-center"
            style={{
              fontSize: 'clamp(14px, 3vw, 36px)',
              fontWeight: '400',
              fontFamily: 'Outreque, sans-serif'
            }}
          >
            © 2024 CodeBattle. Made with ⚡ and too much caffeine.
          </p>
        </footer>

        {/* Auth Modal */}
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          isOpen={showAuthModal}
        />
      </div>
    </div>
  );
}

export default LandingPage;
