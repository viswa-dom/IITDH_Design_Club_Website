import { lazy, Suspense, useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async'

import { Hero } from "./components/Hero";
import { Navbar } from "./components/Navbar";
import { LoginModal } from "./components/LoginModal";
import { SignupModal } from "./components/SignupModal";
import { useAuth } from "./hooks/useAuth";
import { CartProvider } from "./components/CartContext";
import RequireAdmin from "./components/RequireAdmin";

// Policy pages (NOT lazy – Razorpay crawlers need them immediately)
import CancellationRefund from "./policy-pages/CancellationRefund";
import ContactUs from "./policy-pages/ContactUs";
import PrivacyPolicy from "./policy-pages/PrivacyPolicy";
import TermsConditions from "./policy-pages/TermsConditions";
import ShippingPolicy from "./policy-pages/ShippingPolicy";
import AdminMerch from "./components/AdminMerch";
import AdminOrders from "./components/AdminOrders";

// Lazy-loaded components
const Etymology = lazy(() =>
  import("./components/Etymology").then((m) => ({ default: m.Etymology }))
);
const Trivia = lazy(() =>
  import("./components/Trivia").then((m) => ({ default: m.Trivia }))
);
const FeaturedWorks = lazy(() =>
  import("./components/FeaturedWorks").then((m) => ({
    default: m.FeaturedWorks,
  }))
);
const Spirit = lazy(() =>
  import("./components/Spirit").then(m => ({ default: m.Spirit }))
);

const Interactive = lazy(() =>
  import("./components/Interactive").then(m => ({ default: m.Interactive }))
);

const Contact = lazy(() =>
  import("./components/Contact").then(m => ({ default: m.Contact }))
);

const Footer = lazy(() =>
  import("./components/Footer").then(m => ({ default: m.Footer }))
);

const Profile = lazy(() => import("./components/Profile"));

const Merch = lazy(() => import("./components/Merch"));

const Cart = lazy(() => import("./components/Cart"));

const ResetPassword = lazy(() =>
  import("./components/ResetPassword").then(m => ({ default: m.ResetPassword }))
);

const Confirmation = lazy(() => import("./components/OrderConfirmation"));

const Admin = lazy(() =>
  import("./components/Admin").then(m => ({ default: m.default || m.Admin }))
);

const AdminUsers = lazy(() =>
  import("./components/AdminUsers").then(m => ({ default: m.default }))
);

// Loader
const LoadingSection = () => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <div className="animate-pulse text-white text-xl font-light">
      Loading...
    </div>
  </div>
);

// Layout wrapper
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
  const {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  } = useAuth();

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // Open login modal after password reset
  useEffect(() => {
    const handleOpenLogin = () => setShowLogin(true);
    window.addEventListener("open-login", handleOpenLogin);
    return () =>
      window.removeEventListener("open-login", handleOpenLogin);
  }, []);

  if (loading) return <LoadingSection />;

  return (
    <HelmetProvider>    <CartProvider>
      <BrowserRouter>
        <AppLayout
          user={user}
          signOut={signOut}
          setShowLogin={setShowLogin}
          setShowSignup={setShowSignup}
        >
          {/* AUTH MODALS */}
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

          {/* ROUTES */}
          <Routes>
            {/* RESET PASSWORD */}
            <Route
              path="/reset-password"
              element={
                <Suspense fallback={<LoadingSection />}>
                  <ResetPassword />
                </Suspense>
              }
            />

            {/* HOME */}
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
                </>
              }
            />

            {/* USER ROUTES */}
            <Route
              path="/merch"
              element={
                <Suspense fallback={<LoadingSection />}>
                  <Merch />
                </Suspense>
              }
            />

            <Route
              path="/cart"
              element={
                <Suspense fallback={<LoadingSection />}>
                  <Cart />
                </Suspense>
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

            {/* ADMIN (PROTECTED) */}
            <Route element={<RequireAdmin />}>
              <Route
                path="/admin"
                element={
                  <Suspense fallback={<LoadingSection />}>
                    <Admin />
                  </Suspense>
                }
              />

              <Route
                path="/admin/users"
                element={
                  <Suspense fallback={<LoadingSection />}>
                    <AdminUsers />
                  </Suspense>
                }
              />

              <Route
                path="/admin/products"
                element={
                  <Suspense fallback={<LoadingSection />}>
                    <AdminMerch />
                  </Suspense>
                }
              />

              <Route
                path="/admin/orders"
                element={
                  <Suspense fallback={<LoadingSection />}>
                    <AdminOrders />
                  </Suspense>
                }
              />
            </Route>


            {/* CONFIRMATION */}
            <Route path="/confirmation" element={<Confirmation />} />

            {/* POLICY PAGES */}
            <Route
              path="/cancellation-refund"
              element={<CancellationRefund />}
            />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route
              path="/privacy-policy"
              element={<PrivacyPolicy />}
            />
            <Route
              path="/terms-and-conditions"
              element={<TermsConditions />}
            />
            <Route
              path="/shipping-policy"
              element={<ShippingPolicy />}
            />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </CartProvider>
  </HelmetProvider>
  );
}
