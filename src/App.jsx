import { lazy, Suspense, useState } from 'react';
import { Hero } from './components/Hero';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { SignupModal } from './components/SignupModal';
import { useAuth } from './hooks/useAuth';

const Etymology = lazy(() => import('./components/Etymology').then(module => ({ default: module.Etymology })));
const Trivia = lazy(() => import('./components/Trivia').then(module => ({ default: module.Trivia })));
const FeaturedWorks = lazy(() => import('./components/FeaturedWorks').then(module => ({ default: module.FeaturedWorks })));
const Spirit = lazy(() => import('./components/Spirit').then(module => ({ default: module.Spirit })));
const Interactive = lazy(() => import('./components/Interactive').then(module => ({ default: module.Interactive })));
const Contact = lazy(() => import('./components/Contact').then(module => ({ default: module.Contact })));
const Footer = lazy(() => import('./components/Footer').then(module => ({ default: module.Footer })));

const LoadingSection = () => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <div className="animate-pulse text-white text-xl font-light">Loading...</div>
  </div>
);

function App() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const handleLogin = async (email, password) => {
    await signIn(email, password);
  };

  const handleSignup = async (email, password) => {
    await signUp(email, password);
  };

  const handleLogout = async () => {
    await signOut();
  };

  const switchToSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const switchToLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  if (loading) {
    return <LoadingSection />;
  }

  return (
    <div className="bg-black">
      <Navbar
        onLoginClick={() => setShowLogin(true)}
        onSignupClick={() => setShowSignup(true)}
        user={user}
        onLogout={handleLogout}
      />

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={handleLogin}
        onSwitchToSignup={switchToSignup}
      />

      <SignupModal
        isOpen={showSignup}
        onClose={() => setShowSignup(false)}
        onSignup={handleSignup}
        onSwitchToLogin={switchToLogin}
      />

      <div id="hero">
        <Hero />
      </div>

      <div id="etymology">
        <Suspense fallback={<LoadingSection />}>
          <Etymology />
        </Suspense>
      </div>

      <Suspense fallback={<LoadingSection />}>
        <Trivia />
      </Suspense>

      <div id="works">
        <Suspense fallback={<LoadingSection />}>
          <FeaturedWorks />
        </Suspense>
      </div>

      <Suspense fallback={<LoadingSection />}>
        <Spirit />
      </Suspense>

      <Suspense fallback={<LoadingSection />}>
        <Interactive />
      </Suspense>

      <div id="contact">
        <Suspense fallback={<LoadingSection />}>
          <Contact />
        </Suspense>
      </div>

      <Suspense fallback={<LoadingSection />}>
        <Footer />
      </Suspense>
    </div>
  );
}

export default App;