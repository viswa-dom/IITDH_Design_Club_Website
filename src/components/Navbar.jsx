import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import logoImage from '/abhikalpa_text.jpg';

export const Navbar = ({ onLoginClick, onSignupClick, user, onLogout, hideAuthUI }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.app_metadata?.role === 'admin';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track active section based on scroll position
  useEffect(() => {
    // Only track on home page
    if (location.pathname !== '/') {
      setActiveSection('');
      return;
    }

    const sections = ['hero', 'etymology', 'works', 'contact'];
    
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      sections.forEach((sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [location.pathname]);

  // Set active section for merch page
  useEffect(() => {
    if (location.pathname === '/merch') {
      setActiveSection('merch');
    } else if (location.pathname === '/cart') {
      setActiveSection('cart');
    } else if (location.pathname === '/admin' || location.pathname.startsWith('/admin/')) {
      setActiveSection('admin');
    }
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

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

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    
    // List of protected/user-specific pages that should redirect to home on logout
    const protectedPages = ['/profile', '/cart', '/admin', '/admin/users', '/admin/products', '/admin/orders'];
    const currentPath = location.pathname;
    
    // Check if current page is protected or starts with a protected path
    const shouldRedirect = protectedPages.some(page => currentPath.startsWith(page));
    
    // Call the logout function
    await onLogout();
    
    // Redirect to home if on a protected page
    if (shouldRedirect) {
      navigate('/', { replace: true });
    }
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

  // Check if a link is active
  const isLinkActive = (link) => {
    if (link.action === 'merch') {
      return activeSection === 'merch';
    }
    return activeSection === link.id;
  };

  return (
    <>
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
              className="hover:opacity-70 transition-opacity duration-300 z-[70]"
            >
              <img 
                src={logoImage} 
                alt="Abhikalpa" 
                className="h-8 md:h-10 w-auto object-contain mix-blend-lighten"
              />
            </button>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link)}
                  className="relative text-sm font-light transition-colors duration-300 uppercase tracking-wider group"
                >
                  <span className={`transition-colors duration-300 ${
                    isLinkActive(link) ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  }`}>
                    {link.label}
                  </span>
                  {/* Animated Underline */}
                  <span className={`absolute -bottom-1 left-0 h-[2px] bg-white transition-all duration-300 ${
                    isLinkActive(link) ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </button>
              ))}
              {isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="relative text-sm font-light transition-colors duration-300 uppercase tracking-wider group"
                >
                  <span className={`transition-colors duration-300 ${
                    activeSection === 'admin' ? 'text-red-300' : 'text-gray-400 group-hover:text-red-300'
                  }`}>
                    Admin
                  </span>
                  <span className={`absolute -bottom-1 left-0 h-[2px] bg-red-300 transition-all duration-300 ${
                    activeSection === 'admin' ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </button>
              )}
              {user && (
                <button
                  onClick={handleCartClick}
                  className="relative text-sm font-light transition-colors duration-300 uppercase tracking-wider group"
                >
                  <span className={`transition-colors duration-300 ${
                    activeSection === 'cart' ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  }`}>
                    Your Cart
                  </span>
                  <span className={`absolute -bottom-1 left-0 h-[2px] bg-white transition-all duration-300 ${
                    activeSection === 'cart' ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
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
                        onClick={handleLogout}
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

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-white hover:bg-opacity-10 transition-all duration-300 z-[70]"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Full Screen Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Top Bar with Logo and Close Button - Always Visible */}
          <div className="fixed top-0 left-0 right-0 z-[70] bg-black border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  scrollToSection('hero');
                }}
                className="hover:opacity-70 transition-opacity duration-300"
              >
                <img 
                  src={logoImage} 
                  alt="Abhikalpa" 
                  className="h-7 w-auto object-contain mix-blend-lighten"
                />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-white hover:bg-opacity-10 transition-all duration-300 rounded"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Dark Overlay Background */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-95 backdrop-blur-md z-[60]"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu Content */}
          <div className="relative h-full overflow-y-auto z-[60]">
            <div className="min-h-full flex flex-col justify-center px-6 py-24 pt-28">
              {/* Main Navigation Links */}
              <div className="space-y-6 mb-12">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link)}
                    className={`block w-full text-left text-2xl font-light transition-colors duration-300 uppercase tracking-wider py-2 ${
                      isLinkActive(link) ? 'text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {link.label}
                    {/* Mobile underline indicator */}
                    {isLinkActive(link) && (
                      <div className="w-12 h-[2px] bg-white mt-2 animate-slideIn" />
                    )}
                  </button>
                ))}
                {isAdmin && (
                  <button
                    onClick={() => {
                      navigate('/admin');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left text-2xl font-light transition-colors duration-300 uppercase tracking-wider py-2 ${
                      activeSection === 'admin' ? 'text-red-300' : 'text-red-400 hover:text-red-300'
                    }`}
                  >
                    Admin
                    {activeSection === 'admin' && (
                      <div className="w-12 h-[2px] bg-red-300 mt-2 animate-slideIn" />
                    )}
                  </button>
                )}
                {user && (
                  <button
                    onClick={handleCartClick}
                    className={`block w-full text-left text-2xl font-light transition-colors duration-300 uppercase tracking-wider py-2 ${
                      activeSection === 'cart' ? 'text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Your Cart
                    {activeSection === 'cart' && (
                      <div className="w-12 h-[2px] bg-white mt-2 animate-slideIn" />
                    )}
                  </button>
                )}
              </div>

              {/* Auth Section */}
              {!hideAuthUI && (
                <div className="pt-8 border-t border-gray-700">
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-base text-gray-300 mb-6">
                        <User className="w-5 h-5" />
                        <span className="font-light">{user.email}</span>
                      </div>
                      <button
                        onClick={handleProfileClick}
                        className="w-full text-left px-6 py-3 text-lg font-light text-white border border-gray-600 hover:bg-white hover:bg-opacity-10 transition-all duration-300 uppercase tracking-wider"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-3 w-full px-6 py-3 text-lg font-light bg-white text-black hover:bg-gray-200 transition-all duration-300 uppercase tracking-wider"
                      >
                        <LogOut className="w-5 h-5" />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <button
                        onClick={onLoginClick}
                        className="block w-full text-center px-6 py-3 text-lg font-light text-white border border-gray-600 hover:bg-white hover:bg-opacity-10 transition-all duration-300 uppercase tracking-wider"
                      >
                        Login
                      </button>
                      <button
                        onClick={onSignupClick}
                        className="w-full px-6 py-3 text-lg font-light bg-white text-black hover:bg-gray-200 transition-all duration-300 uppercase tracking-wider"
                      >
                        Sign Up
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS for underline animation */}
      <style>{`
        @keyframes slideIn {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            width: 3rem;
            opacity: 1;
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};