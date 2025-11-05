import { lazy, Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
const Profile = lazy(() => import('./components/Profile'));
const Merch = lazy(() => import('./components/Merch'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword'));

const LoadingSection = () => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <div className="animate-pulse text-white text-xl font-light">Loading...</div>
  </div>
);

function App() {
  const { user, loading, signIn, signUp, signOut, signInWithGoogle } = useAuth();
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
    <Router>
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
          onGoogleSignIn={signInWithGoogle}
          onSwitchToSignup={switchToSignup}
        />

        <SignupModal
          isOpen={showSignup}
          onClose={() => setShowSignup(false)}
          onSignup={handleSignup}
          onGoogleSignIn={signInWithGoogle}
          onSwitchToLogin={switchToLogin}
        />

        <Routes>
          <Route
            path="/"
            element={
              <>
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
              </>
            }
          />

          <Route
            path="/profile"
            element={
              user ? (
                <Suspense fallback={<LoadingSection />}>
                  <Profile />
                </Suspense>
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route
            path="/merch"
            element={
              <Suspense fallback={<LoadingSection />}>
                <Merch />
              </Suspense>
            }
          />

          <Route
            path="/forgot-password"
            element={
              <Suspense fallback={<LoadingSection />}>
                <ForgotPassword />
              </Suspense>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;