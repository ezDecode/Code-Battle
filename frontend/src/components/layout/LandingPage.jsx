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

// Enhanced CTA Button Component with optimized responsive design
const CTAButton = memo(({ children, onClick, ariaLabel, variant = 'primary', className = '' }) => {
  const baseStyles = {
    fontFamily: 'Outreque, sans-serif',
    fontWeight: '700',
    minWidth: 'clamp(200px, 45vw, 280px)',
    height: 'clamp(48px, 6vw, 64px)', // Increased minimum height for better touch targets
    borderRadius: 'clamp(24px, 3vw, 32px)',
    fontSize: 'clamp(16px, 2.8vw, 20px)', // Improved text scaling
    padding: '0 clamp(16px, 3vw, 24px)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center'
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
      className={`inline-flex items-center justify-center font-bold transition-all duration-300 hover:opacity-90 focus:opacity-90 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-30 ${className}`}
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

      {/* Main container - Enhanced responsive layout with optimal tablet experience */}
      <div 
        className="mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16"
        style={{ maxWidth: 'clamp(320px, 100vw, 1400px)' }}
      >
        
        {/* HERO SECTION */}
        <section className="relative min-h-screen flex flex-col" role="banner">
          {/* Navigation Header - Enhanced responsive layout with better tablet support */}
          <header className="flex items-center justify-between z-10 w-full pt-4 sm:pt-5 md:pt-6 lg:pt-8" style={{ minHeight: '80px' }}>
            {/* Logo - Optimized responsive scaling */}
            <div className="flex-shrink-0">
              <div 
                className="text-black font-bold"
                style={{
                  fontSize: 'clamp(28px, 5vw, 36px)',
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

            {/* Right Navigation - Improved spacing and touch targets */}
            <nav className="flex items-center gap-2 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8" role="navigation">
              <button
                onClick={handleSignIn}
                className="text-black font-bold hover:opacity-70 focus:opacity-70 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-opacity duration-300 rounded-lg px-3 py-2 md:px-4"
                style={{
                  fontSize: 'clamp(16px, 3.5vw, 24px)',
                  fontWeight: '700',
                  fontFamily: 'Outreque, sans-serif',
                  minHeight: '44px' // Ensure touch target
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

          {/* Hero Content - Enhanced responsive spacing and typography */}
          <main 
            id="main-content" 
            className="flex-1 flex flex-col items-center justify-center text-center px-2 sm:px-3 md:px-4 lg:px-6"
            role="main"
            style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}
          >
            <div className="w-full max-w-full">
              {/* Main Headline - Optimized responsive scaling */}
              <h1 
                className="text-black font-black leading-tight mb-4 sm:mb-6 md:mb-8 lg:mb-12"
                style={{
                  fontSize: 'clamp(44px, 10vw, 140px)',
                  fontWeight: '900',
                  fontFamily: 'Outreque, sans-serif',
                  lineHeight: '0.9',
                  letterSpacing: '-0.02em'
                }}
              >
                Code & Compete
              </h1>

              {/* Subtitle - Enhanced responsive design */}
              <div className="w-full flex justify-center mb-6 sm:mb-8 md:mb-12 lg:mb-16">
                <p 
                  className="text-center px-3 sm:px-4 md:px-6"
                  style={{
                    color: '#000000',
                    fontSize: 'clamp(16px, 3.5vw, 32px)',
                    fontWeight: '500',
                    fontFamily: 'Outreque, sans-serif',
                    lineHeight: '1.5',
                    opacity: '0.9',
                    maxWidth: 'clamp(340px, 90vw, 1000px)',
                    margin: '0 auto'
                  }}
                >
                  Form your squad, conquer challenges together, and climb the ranks — all synced with your 
                  <span style={{ color: '#FF0000', fontWeight: '600' }}> LeetCode streaks</span>.
                </p>
              </div>

              {/* CTA Buttons - Improved responsive stacking and spacing */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 lg:gap-8 justify-center items-center w-full max-w-none mx-auto px-3 sm:px-4">
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

        {/* FEATURES SECTION - Complete responsive redesign with proper tablet layout */}
        <section 
          className="relative py-12 sm:py-16 md:py-20 lg:py-24" 
          role="region" 
          aria-labelledby="features-heading"
        >
          <div className="w-full flex flex-col items-center text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20 px-3 sm:px-4 md:px-6">
            <h2 
              id="features-heading"
              className="text-black font-black leading-tight mb-3 sm:mb-4 md:mb-6 text-center"
              style={{
                fontSize: 'clamp(36px, 7vw, 72px)',
                fontWeight: '900',
                fontFamily: 'Outreque, sans-serif',
                lineHeight: '0.95',
                textAlign: 'center'
              }}
            >
              Why CodeBattle?
            </h2>
            <p 
              className="text-center text-black px-3 sm:px-4"
              style={{
                fontSize: 'clamp(16px, 2.8vw, 22px)',
                fontWeight: '400',
                fontFamily: 'Outreque, sans-serif',
                lineHeight: '1.6',
                opacity: '0.8',
                textAlign: 'center',
                maxWidth: '700px',
                margin: '0 auto'
              }}
            >
              The ultimate platform for competitive programming with friends
            </p>
          </div>
          
          <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
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
                  className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 text-center hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col items-center"
                  style={{ 
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    minHeight: '280px'
                  }}
                >
                  <h3 
                    className="text-black font-black mb-3 sm:mb-4 text-center"
                    style={{
                      fontSize: 'clamp(20px, 3.5vw, 26px)',
                      fontWeight: '900',
                      fontFamily: 'Outreque, sans-serif',
                      lineHeight: '1.3',
                      textAlign: 'center'
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p 
                    className="text-black text-center flex-1 flex items-center"
                    style={{
                      fontSize: 'clamp(14px, 2.5vw, 16px)',
                      fontWeight: '400',
                      fontFamily: 'Outreque, sans-serif',
                      lineHeight: '1.6',
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

        {/* TEAM SECTION - Enhanced responsive design with better spacing */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-3 sm:px-4 md:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="w-full max-w-full">
            
            {/* Section Headline - Optimized responsive scaling */}
            <h2 
              className="text-black font-black leading-tight mb-4 sm:mb-6 md:mb-8 lg:mb-12 relative z-10"
              style={{
                fontSize: 'clamp(42px, 9vw, 120px)',
                fontWeight: '900',
                fontFamily: 'Outreque, sans-serif',
                lineHeight: '0.9',
                letterSpacing: '-0.02em'
              }}
            >
              Assemble & Conquer
            </h2>

            {/* Section Subtitle - Enhanced responsive design */}
            <div className="w-full flex justify-center mb-6 sm:mb-8 md:mb-12 lg:mb-16">
              <p 
                className="text-center px-3 sm:px-4 md:px-6 relative z-10"
                style={{
                  color: '#000000',
                  fontSize: 'clamp(16px, 3.5vw, 32px)',
                  fontWeight: '500',
                  fontFamily: 'Outreque, sans-serif',
                  lineHeight: '1.5',
                  opacity: '0.9',
                  maxWidth: 'clamp(320px, 85vw, 750px)',
                  margin: '0 auto'
                }}
              >
                It's more fun together. Invite your friends, challenge each other, and 
                <span style={{ color: '#FF0000', fontWeight: '600' }}> rise to the top</span>.
              </p>
            </div>

            {/* CTA Button - Better responsive positioning */}
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

        {/* FOOTER - Enhanced responsive styling */}
        <footer 
          className="relative flex justify-center items-center py-6 sm:py-8 md:py-10 lg:py-12 z-10 px-3 sm:px-4 border-t border-gray-200/50" 
          role="contentinfo"
        >
          <p 
            className="text-black text-center"
            style={{
              fontSize: 'clamp(14px, 2.5vw, 18px)',
              fontWeight: '400',
              fontFamily: 'Outreque, sans-serif',
              opacity: '0.7',
              lineHeight: '1.5'
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
