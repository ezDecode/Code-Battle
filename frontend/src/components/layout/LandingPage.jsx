import { memo, useCallback, useState, useEffect } from 'react';
import { AuthModal } from '@/components/ui/AuthModal';

// Optimized smooth scroll hook with perfect performance
const useSmoothScroll = () => {
  useEffect(() => {
    let lenis;
    
    const initLenis = async () => {
      try {
        const { default: Lenis } = await import('lenis');
        
        lenis = new Lenis({
          duration: 1.0,
          easing: (t) => 1 - Math.pow(1 - t, 3),
          direction: 'vertical',
          gestureDirection: 'vertical',
          smooth: true,
          mouseMultiplier: 0.8,
          smoothTouch: true,
          touchMultiplier: 1.5,
          infinite: false,
          normalizeWheel: true,
          syncTouch: true
        });

        const raf = (time) => {
          lenis.raf(time);
          requestAnimationFrame(raf);
        };
        
        requestAnimationFrame(raf);
        document.documentElement.style.scrollBehavior = 'auto';
        
      } catch (error) {
        console.warn('Lenis could not be loaded, falling back to native scroll:', error);
      }
    };

    initLenis();
    
    return () => {
      if (lenis) {
        lenis.destroy();
        document.documentElement.style.scrollBehavior = '';
      }
    };
  }, []);
};

// Enhanced CTA Button Component
const CTAButton = memo(({ children, onClick, ariaLabel, variant = 'primary', className = '' }) => {
  const baseStyles = {
    fontFamily: 'Outreque, sans-serif',
    fontWeight: '700',
    minWidth: 'clamp(180px, 40vw, 320px)',
    height: 'clamp(44px, 8vw, 72px)',
    borderRadius: 'clamp(22px, 4vw, 36px)',
    fontSize: 'clamp(14px, 3.2vw, 22px)',
    padding: '0 clamp(14px, 3.5vw, 28px)',
    border: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.3s ease'
  };

  const variantStyles = variant === 'outline' 
    ? { 
        backgroundColor: 'transparent', 
        color: 'black', 
        border: '2px solid #FF0000' 
      }
    : { 
        backgroundColor: '#FF0000', 
        color: 'black' 
      };

  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center font-bold transition-opacity duration-300 hover:opacity-90 focus:opacity-90 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-30 ${className}`}
      style={{
        ...baseStyles,
        ...variantStyles
      }}
    >
      {children}
    </button>
  );
});

CTAButton.displayName = 'CTAButton';

// Main Landing Page Component
const LandingPage = memo(() => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // Modal handlers
  const handleSignIn = useCallback(() => {
    setAuthMode('login');
    setShowAuthModal(true);
  }, []);

  const handleGetStarted = useCallback(() => {
    setAuthMode('register');
    setShowAuthModal(true);
  }, []);

  const handleJoinTeam = useCallback(() => {
    setAuthMode('register');
    setShowAuthModal(true);
  }, []);

  const handleStartCompeting = useCallback(() => {
    setAuthMode('login');
    setShowAuthModal(true);
  }, []);

  // Initialize optimized smooth scrolling
  useSmoothScroll();

  return (
    <div 
      className="text-black min-h-screen w-full overflow-x-hidden"
      style={{ backgroundColor: '#F8F8F8' }}
    >
      {/* Skip link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only absolute top-4 left-4 bg-white text-black px-4 py-2 rounded-lg z-50 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-lg"
        style={{ fontFamily: 'Outreque, sans-serif' }}
      >
        Skip to main content
      </a>

      {/* Main container - Dynamic responsive layout */}
      <div 
        className="mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20"
        style={{ maxWidth: 'clamp(320px, 95vw, 1600px)' }}
      >
        
        {/* HERO SECTION */}
        <section className="relative min-h-screen flex flex-col" role="banner">
          {/* Navigation Header - Perfectly aligned */}
          <header className="flex items-center justify-between z-10 w-full pt-4 sm:pt-6 md:pt-8" style={{ minHeight: '80px' }}>
            {/* Logo - Exact match with NavigationBar */}
            <div className="flex-shrink-0">
              <div 
                className="text-black font-bold"
                style={{
                  fontSize: 'clamp(24px, 6vw, 36px)',
                  fontWeight: '700',
                  fontFamily: 'Outreque, sans-serif',
                  lineHeight: '1'
                }}
                role="img"
                aria-label="CodeBattle Logo"
              >
                CodeBattle
              </div>
            </div>

            {/* Right Navigation - Enhanced layout */}
            <nav className="flex items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8" role="navigation">
              <button
                onClick={handleSignIn}
                className="text-black font-bold hover:opacity-70 focus:opacity-70 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-opacity duration-300 rounded-lg px-4 py-2"
                style={{
                  fontSize: 'clamp(16px, 4vw, 26px)',
                  fontWeight: '700',
                  fontFamily: 'Outreque, sans-serif'
                }}
                aria-label="Sign in to your account"
              >
                Sign In
              </button>

              <CTAButton
                onClick={handleGetStarted}
                ariaLabel="Get started with CodeBattle for free"
                className="shadow-lg hover:shadow-xl"
              >
                Get Started Free
              </CTAButton>
            </nav>
          </header>

          {/* Hero Content - Optimized spacing and typography */}
          <main 
            id="main-content" 
            className="flex-1 flex flex-col items-center justify-center text-center px-2 sm:px-4 md:px-6"
            role="main"
            style={{ paddingTop: '2rem', paddingBottom: '2rem' }}
          >
            <div className="w-full max-w-full">
              {/* Main Headline - Enhanced with better spacing */}
              <h1 
                className="text-black font-black leading-tight mb-6 sm:mb-8 md:mb-12"
                style={{
                  fontSize: 'clamp(48px, 12vw, 160px)',
                  fontWeight: '900',
                  fontFamily: 'Outreque, sans-serif',
                  lineHeight: '0.85',
                  letterSpacing: '-0.02em'
                }}
              >
                Code & Compete
              </h1>

              {/* Subtitle - Clean and optimized */}
              <div className="w-full flex justify-center mb-8 sm:mb-10 md:mb-16">
                <p 
                  className="text-center px-4"
                  style={{
                    color: '#000000',
                    fontSize: 'clamp(16px, 4vw, 36px)',
                    fontWeight: '500',
                    fontFamily: 'Outreque, sans-serif',
                    lineHeight: '1.4',
                    opacity: '0.9',
                    maxWidth: 'clamp(384px, 92vw, 1080px)',
                    margin: '0 auto'
                  }}
                >
                  Form your squad, conquer challenges together, and climb the ranks — all synced with your 
                  <span style={{ color: '#FF0000', fontWeight: '600' }}> LeetCode streaks</span>.
                </p>
              </div>

              {/* CTA Buttons - Enhanced layout and interaction */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 justify-center items-center w-full max-w-none mx-auto px-4">
                <CTAButton
                  onClick={handleJoinTeam}
                  ariaLabel="Join a team and start competing"
                  className="shadow-lg hover:shadow-xl w-full sm:w-auto"
                >
                  Join A Team
                </CTAButton>
                <CTAButton
                  onClick={handleStartCompeting}
                  ariaLabel="Start competing in coding challenges"
                  variant="outline"
                  className="shadow-lg hover:shadow-xl hover:bg-red-500 hover:text-black w-full sm:w-auto"
                >
                  Start Competing
                </CTAButton>
              </div>
            </div>
          </main>
        </section>

        {/* FEATURES SECTION - Enhanced with better visual hierarchy */}
        <section 
          className="relative py-16 sm:py-20 md:py-24" 
          role="region" 
          aria-labelledby="features-heading"
        >
          <div className="w-full flex flex-col items-center text-center mb-12 sm:mb-16 md:mb-20">
            <h2 
              id="features-heading"
              className="text-black font-black leading-tight mb-4 sm:mb-6 text-center"
              style={{
                fontSize: 'clamp(32px, 8vw, 80px)',
                fontWeight: '900',
                fontFamily: 'Outreque, sans-serif',
                lineHeight: '0.9',
                textAlign: 'center'
              }}
            >
              Why CodeBattle?
            </h2>
            <p 
              className="text-center text-black px-4"
              style={{
                fontSize: 'clamp(14px, 3vw, 24px)',
                fontWeight: '400',
                fontFamily: 'Outreque, sans-serif',
                lineHeight: '1.5',
                opacity: '0.8',
                textAlign: 'center',
                maxWidth: '768px',
                margin: '0 auto'
              }}
            >
              The ultimate platform for competitive programming with friends
            </p>
          </div>
          
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  title: "⚡ Syncs with LeetCode",
                  description: "Automatically track your progress and integrate with your existing coding practice routine."
                },
                {
                  title: "🏆 Real-time Leaderboards",
                  description: "See how your team ranks against others with live updates and competitive scoring systems."
                },
                {
                  title: "🚀 Weekly Code Sprints",
                  description: "Participate in timed challenges and sprint competitions designed to push your limits."
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-3xl shadow-lg p-6 lg:p-8 text-center hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col items-center"
                  style={{ 
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
                  }}
                >
                  <h3 
                    className="text-black font-black mb-4 text-center"
                    style={{
                      fontSize: 'clamp(18px, 4vw, 28px)',
                      fontWeight: '900',
                      fontFamily: 'Outreque, sans-serif',
                      lineHeight: '1.2',
                      textAlign: 'center'
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p 
                    className="text-black text-center"
                    style={{
                      fontSize: 'clamp(14px, 3vw, 18px)',
                      fontWeight: '400',
                      fontFamily: 'Outreque, sans-serif',
                      lineHeight: '1.5',
                      opacity: '0.8',
                      textAlign: 'center'
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TEAM SECTION - Enhanced with better visual impact */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-2 sm:px-4 md:px-6 py-8 sm:py-12 md:py-16">
          <div className="w-full max-w-full">
            
            {/* Section Headline */}
            <h2 
              className="text-black font-black leading-tight mb-6 sm:mb-8 md:mb-12 relative z-10"
              style={{
                fontSize: 'clamp(40px, 10vw, 130px)',
                fontWeight: '900',
                fontFamily: 'Outreque, sans-serif',
                lineHeight: '0.85',
                letterSpacing: '-0.02em'
              }}
            >
              Assemble & Conquer
            </h2>

            {/* Section Subtitle - Clean and optimized */}
            <div className="w-full flex justify-center mb-8 sm:mb-10 md:mb-16">
              <p 
                className="text-center px-4 relative z-10"
                style={{
                  color: '#000000',
                  fontSize: 'clamp(16px, 4vw, 36px)',
                  fontWeight: '500',
                  fontFamily: 'Outreque, sans-serif',
                  lineHeight: '1.4',
                  opacity: '0.9',
                  maxWidth: 'clamp(320px, 80vw, 800px)',
                  margin: '0 auto'
                }}
              >
                It's more fun together. Invite your friends, challenge each other, and 
                <span style={{ color: '#FF0000', fontWeight: '600' }}> rise to the top</span>.
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center items-center relative z-10">
              <CTAButton
                onClick={handleJoinTeam}
                ariaLabel="Team up now and start competing together"
                className="shadow-2xl hover:shadow-3xl"
              >
                Team Up Now
              </CTAButton>
            </div>
          </div>
        </section>

        {/* FOOTER - Enhanced styling */}
        <footer 
          className="relative flex justify-center items-center py-8 sm:py-10 md:py-12 z-10 px-2 sm:px-4 border-t border-gray-200/50" 
          role="contentinfo"
        >
          <p 
            className="text-black text-center"
            style={{
              fontSize: 'clamp(14px, 3vw, 20px)',
              fontWeight: '400',
              fontFamily: 'Outreque, sans-serif',
              opacity: '0.7'
            }}
          >
            © 2025 CodeBattle. Made with ⚡ and too much caffeine.
          </p>
        </footer>
      </div>

      {/* Auth Modal */}
      <AuthModal
        mode={authMode}
        onClose={() => setShowAuthModal(false)}
        isOpen={showAuthModal}
      />
    </div>
  );
});

LandingPage.displayName = 'LandingPage';

export default LandingPage;
