import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Navbar = ({ onLoginClick, onSignupClick, user, onLogout, hideAuthUI }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    // If we're not on the home page, navigate to home first
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // If already on home page, just scroll
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  const handleMerchClick = () => {
    navigate('/merch');
    setIsMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'Home', id: 'hero' },
    { label: 'About', id: 'etymology' },
    { label: 'Works', id: 'works' },
    { label: 'Merch', action: 'merch' },
    { label: 'Contact', id: 'contact' },
  ];

  const handleNavClick = (link) => {
    if (link.action === 'merch') {
      handleMerchClick();
    } else {
      scrollToSection(link.id);
    }
  };

  const handleCartClick = () => {
    navigate('/cart');
    setIsMobileMenuOpen(false);
  };

  console.log('USER:', user);
  console.log('ADMIN?', isAdmin);



  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-black bg-opacity-95 backdrop-blur-sm border-b border-gray-900'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => scrollToSection('hero')}
            className="text-xl md:text-2xl font-light tracking-tight hover:opacity-70 transition-opacity duration-300"
          >
            ABHIKALPA
          </button>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link)}
                className="text-sm font-light text-gray-400 hover:text-white transition-colors duration-300 uppercase tracking-wider"
              >
                {link.label}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="text-sm font-light text-red-400 hover:text-red-300 transition-colors duration-300 uppercase tracking-wider"
              >
                Admin
              </button>
            )}
            {user && (
              <button
                onClick={handleCartClick}
                className="text-sm font-light text-gray-400 hover:text-white transition-colors duration-300 uppercase tracking-wider"
              >
                Your Cart
              </button>
            )}


            {/* Hide ALL auth buttons if hideAuthUI is true */}
            {!hideAuthUI && (
              <>
                {user ? (
                  <div className="flex items-center gap-4 ml-4">
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      <User className="w-4 h-4" />
                      <span className="font-light">Profile</span>
                    </button>
                    <button
                      onClick={onLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-light border border-white hover:bg-white hover:text-black transition-all duration-300"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 ml-4">
                    <button
                      onClick={onLoginClick}
                      className="text-sm font-light text-gray-400 hover:text-white transition-colors duration-300 uppercase tracking-wider"
                    >
                      Login
                    </button>
                    <button
                      onClick={onSignupClick}
                      className="px-6 py-2 text-sm font-light bg-white text-black hover:bg-gray-200 transition-all duration-300 uppercase tracking-wider"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-white hover:bg-opacity-10 transition-all duration-300"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden mt-6 pb-4 space-y-4 border-t border-gray-900 pt-4">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link)}
                className="block w-full text-left text-sm font-light text-gray-400 hover:text-white transition-colors duration-300 uppercase tracking-wider"
              >
                {link.label}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => {
                  navigate('/admin');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left text-sm font-light text-red-400 hover:text-red-300 transition-colors duration-300 uppercase tracking-wider"
              >
                Admin
              </button>
            )}
            {user && (
              <button
                onClick={handleCartClick}
                className="block w-full text-left text-sm font-light text-gray-400 hover:text-white transition-colors duration-300 uppercase tracking-wider"
              >
                Your Cart
              </button>
            )}


            {/* Hide ALL mobile auth UI if hideAuthUI is true */}
            {!hideAuthUI && (
              <>
                {user ? (
                  <div className="pt-4 border-t border-gray-900 space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <User className="w-4 h-4" />
                      <span className="font-light">{user.email}</span>
                    </div>
                    <button
                      onClick={handleProfileClick}
                      className="w-full text-left px-4 py-2 text-sm font-light text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={onLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm font-light border border-white hover:bg-white hover:text-black transition-all duration-300"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-gray-900 space-y-4">
                    <button
                      onClick={onLoginClick}
                      className="block w-full text-left text-sm font-light text-gray-400 hover:text-white transition-colors duration-300 uppercase tracking-wider"
                    >
                      Login
                    </button>
                    <button
                      onClick={onSignupClick}
                      className="w-full px-6 py-2 text-sm font-light bg-white text-black hover:bg-gray-200 transition-all duration-300 uppercase tracking-wider"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};