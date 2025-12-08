import { lazy, Suspense, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import { Hero } from "./components/Hero";
import { Navbar } from "./components/Navbar";
import { LoginModal } from "./components/LoginModal";
import { SignupModal } from "./components/SignupModal";
import { useAuth } from "./hooks/useAuth";
import { CartProvider } from "./components/CartContext";

import CancellationRefund from "./policy-pages/CancellationRefund";
import ContactUs from "./policy-pages/ContactUs";
import PrivacyPolicy from "./policy-pages/PrivacyPolicy";
import TermsConditions from "./policy-pages/TermsConditions";
import ShippingPolicy from "./policy-pages/ShippingPolicy";

// Lazy imports
const Etymology = lazy(() => import("./components/Etymology").then(m => ({ default: m.Etymology })));
const Trivia = lazy(() => import("./components/Trivia").then(m => ({ default: m.Trivia })));
const FeaturedWorks = lazy(() => import("./components/FeaturedWorks").then(m => ({ default: m.FeaturedWorks })));
const Spirit = lazy(() => import("./components/Spirit").then(m => ({ default: m.Spirit })));
const Interactive = lazy(() => import("./components/Interactive").then(m => ({ default: m.Interactive })));
const Contact = lazy(() => import("./components/Contact").then(m => ({ default: m.Contact })));
const Footer = lazy(() => import("./components/Footer").then(m => ({ default: m.Footer })));
const Profile = lazy(() => import("./components/Profile"));
const Merch = lazy(() => import("./components/Merch"));
const Cart = lazy(() => import("./components/Cart"));
const ResetPassword = lazy(() => import("./components/ResetPassword"));


// Loader
const LoadingSection = () => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <div className="animate-pulse text-white text-xl font-light">Loading...</div>
  </div>
);

// App Layout with conditional navbar
function AppLayout({ children, user, signOut, setShowLogin, setShowSignup }) {
  const location = useLocation();
  const hideNavbar = location.pathname === "/reset-password";

  return (
    <>
      {!hideNavbar && (
        <Navbar
          onLoginClick={() => setShowLogin(true)}
          onSignupClick={() => setShowSignup(true)}
          user={user}
          onLogout={signOut}
        />
      )}
      {children}

      <Suspense fallback={<div />}>
        <Footer />
      </Suspense>
    </>
  );
}

export default function App() {
  const { user, loading, signIn, signUp, signOut, signInWithGoogle } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // Listen for custom event to open login modal (from password reset)
  useEffect(() => {
    const handleOpenLogin = () => {
      setShowLogin(true);
    };

    window.addEventListener("open-login", handleOpenLogin);
    return () => window.removeEventListener("open-login", handleOpenLogin);
  }, []);

  if (loading) return <LoadingSection />;

  return (
    <CartProvider>
      <BrowserRouter>
        <AppLayout 
          user={user} 
          signOut={signOut} 
          setShowLogin={setShowLogin}
          setShowSignup={setShowSignup}
        >

      {/* LOGIN MODAL (includes ForgotPassword inside) */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={signIn}
        onGoogleSignIn={signInWithGoogle}
        onSwitchToSignup={() => {
          setShowLogin(false);
          setShowSignup(true);
        }}
      />

      {/* SIGNUP MODAL */}
      <SignupModal
        isOpen={showSignup}
        onClose={() => setShowSignup(false)}
        onSignup={signUp}
        onGoogleSignIn={signInWithGoogle}
        onSwitchToLogin={() => {
          setShowSignup(false);
          setShowLogin(true);
        }}
      />

      {/* ALL ROUTES IN ONE ROUTER */}
      <Routes>

        {/* RESET PASSWORD MUST BE ABOVE "/" */}
        <Route
          path="/reset-password"
          element={
            <Suspense fallback={<LoadingSection />}>
              <ResetPassword />
            </Suspense>
          }
        />

        {/* HOME PAGE */}
        <Route
          path="/"
          element={
            <>
              <div id="hero"><Hero /></div>

              <div id="etymology">
                <Suspense fallback={<LoadingSection />}><Etymology /></Suspense>
              </div>

              <Suspense fallback={<LoadingSection />}><Trivia /></Suspense>

              <div id="works">
                <Suspense fallback={<LoadingSection />}><FeaturedWorks /></Suspense>
              </div>

              <Suspense fallback={<LoadingSection />}><Spirit /></Suspense>
              <Suspense fallback={<LoadingSection />}><Interactive /></Suspense>

              <div id="contact">
                <Suspense fallback={<LoadingSection />}><Contact /></Suspense>
              </div>
            </>
          }
        />

        {/* OTHER ROUTES */}
        <Route
          path="/merch"
          element={<Suspense fallback={<LoadingSection />}><Merch /></Suspense>}
        />

        <Route
          path="/cart"
          element={<Suspense fallback={<LoadingSection />}><Cart /></Suspense>}
        />

        <Route
          path="/profile"
          element={
            user
              ? <Suspense fallback={<LoadingSection />}><Profile /></Suspense>
              : <Navigate to="/" />
          }
        />

        <Route path="/cancellation-refund" element={<CancellationRefund />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsConditions />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />


      </Routes>

      </AppLayout>
    </BrowserRouter>
    </CartProvider>
  );
}