'use client';

import { useState, useContext, createContext, useMemo, useCallback, useEffect } from 'react';
import { Menu, X, ChevronDown, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { shopifyService } from '@/services/shopify/shopify';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import CartDropdown from './CartDropdown';
import AuthModal from './auth/AuthModal';
import UserDropdown from './auth/UserDropdown';
import WishlistIntegration from './wishlist/WishlistIntegration';

// Create context for navbar state
const NavbarContext = createContext();

export const useNavbar = () => {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error('useNavbar must be used within a NavbarProvider');
  }
  return context;
};

// Pre-defined style objects to avoid recreation
const NAVBAR_STYLES = {
  hero: {
    bg: 'bg-transparent',
    text: 'text-white',
    hover: 'hover:text-gray-300'
  },
  women: {
    bg: 'bg-transparent',
    text: 'text-black',
    hover: 'hover:text-gray-600'
  },
  men: {
    bg: 'bg-transparent',
    text: 'text-black',
    hover: 'hover:text-gray-300'
  },
  'second-video': {
    bg: 'bg-transparent',
    text: 'text-white',
    hover: 'hover:text-gray-300'
  },
  footer: {
    bg: 'bg-transparent',
    text: 'text-white',
    hover: 'hover:text-gray-600'
  },
  default: {
    bg: 'bg-transparent',
    text: 'text-black',
    hover: 'hover:text-gray-600'
  }
};

// Static black navbar styles for non-home pages
const STATIC_NAVBAR_STYLES = {
  bg: 'bg-transparent',
  text: 'text-black',
  hover: 'hover:text-gray-300'
};

export const NavbarProvider = ({ children }) => {
  const [currentSection, setCurrentSection] = useState('hero');
  const [activeDropdown, setActiveDropdown] = useState(null);

  const getNavbarStyles = useCallback((section) => {
    return NAVBAR_STYLES[section] || NAVBAR_STYLES.default;
  }, []);

  const contextValue = useMemo(() => ({
    currentSection,
    setCurrentSection,
    activeDropdown,
    setActiveDropdown,
    getNavbarStyles
  }), [currentSection, activeDropdown, getNavbarStyles]);

  return (
    <NavbarContext.Provider value={contextValue}>
      {children}
    </NavbarContext.Provider>
  );
};

// Dropdown component for desktop
const DropdownMenu = ({ items, styles, isOpen, onMouseEnter, onMouseLeave }) => {
  if (!isOpen) return null;

  return (
    <div
      className={`absolute top-0 left-0 w-full bg-gray-50/90 backdrop-blur-sm z-10 overflow-hidden`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        animation: 'elegantDropdown 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards'
      }}
    >
      {/* Empty space to cover navbar area */}
      <div className="h-20"></div>
      
      {/* Dropdown content */}
      <div className="py-12">
        <div className="px-8 w-full flex justify-start gap-20">
          {items.map((item, index) => (
            <div key={index} className="min-w-[200px]">
              <div className="space-y-3">
                <a
                  href={item.href}
                  className="block text-sm uppercase tracking-widest text-black hover:text-gray-500 transition-colors duration-200 py-1 font-light"
                >
                  {item.name}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes elegantDropdown {
          0% {
            opacity: 0;
            transform: translateY(-100%) scaleY(0.9);
          }
          
          100% {
            opacity: 1;
            transform: translateY(0) scaleY(1);
          }
        }
      `}</style>
    </div>
  );
};

// Mobile dropdown component
const MobileDropdownMenu = ({ items, styles, isOpen, onToggle }) => {
  if (!isOpen) return null;

  return (
    <div className="pl-4 border-l border-gray-200 ml-4 mt-2">
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={index} className="mb-3 last:mb-0">
            <div className="space-y-1">
              <a
                href={item.href}
                className={`block text-sm ${styles.text} ${styles.hover} transition-colors duration-200 py-1 pl-2`}
              >
                {item.name}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Memoized link components to prevent unnecessary re-renders
const NavLink = ({ link, styles, hasDropdown, isDropdownOpen, onMouseEnter, onMouseLeave }) => (
  <div className="relative" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
    <a
      href={link.href}
      className={`text-xs font-light uppercase tracking-widest ${styles.text} ${styles.hover} transition-all duration-500 ease-out flex items-center gap-1`}
    >
      {link.name}
      {hasDropdown && <ChevronDown size={12} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />}
    </a>
  </div>
);

const MobileNavLink = ({ link, styles, hasDropdown, isDropdownOpen, onToggle }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <a
        href={link.href}
        className="block text-sm font-light uppercase tracking-widest text-black hover:text-gray-600 transition-colors duration-200 py-2 flex-1"
      >
        {link.name}
      </a>
      {hasDropdown && (
        <button
          onClick={onToggle}
          className="text-black hover:text-gray-600 transition-colors duration-200 p-2 touch-manipulation"
          style={{ touchAction: 'manipulation' }}
        >
          <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
    {hasDropdown && (
      <MobileDropdownMenu
        items={link.dropdownItems}
        styles={styles}
        isOpen={isDropdownOpen}
        onToggle={onToggle}
      />
    )}
  </div>
);

export default function Navbar() {
  const pathname = usePathname();
  const { currentSection, getNavbarStyles, activeDropdown, setActiveDropdown } = useNavbar();
  const { getItemCount } = useCart();
  const { isAuthenticated, user } = useUser();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileDropdowns, setMobileDropdowns] = useState({});
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // NEW: dynamic nav links from Shopify with caching
  const [navLinks, setNavLinks] = useState([]);
  const [menuLoaded, setMenuLoaded] = useState(false);

  const isHomePage = isClient && pathname === '/';

  // Ensure client-side hydration consistency
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load menu from Shopify with caching (handle: 'main-menu-1' — change if yours differs)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Call Shopify directly - no caching
        console.log('🔄 Fetching menu data directly from Shopify...');
        const links = await shopifyService.getNavLinks('main-menu-1');
        console.log('📋 Menu links from Shopify:', links);
        if (mounted) {
          setNavLinks(links);
          setMenuLoaded(true);
        }
      } catch (e) {
        console.error('Menu load failed:', e);
        if (mounted) {
          setNavLinks([]); // fail safe
          setMenuLoaded(true);
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const toggleMobileDropdown = useCallback((linkName) => {
    setMobileDropdowns(prev => ({
      ...prev,
      [linkName]: !prev[linkName]
    }));
  }, []);


  const handleMouseEnter = useCallback((linkName) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setActiveDropdown(linkName);
  }, [hoverTimeout, setActiveDropdown]);

  const handleMouseLeave = useCallback(() => {
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
    setHoverTimeout(timeout);
  }, [setActiveDropdown]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    return () => {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) window.scrollTo(0, parseInt(scrollY || '0') * -1);
    };
  }, [isMobileMenuOpen]);

  // Styles (same as your original)
  const styles = useMemo(() => {
    if (!isClient) {
      return STATIC_NAVBAR_STYLES; // Always use static styles during SSR
    }
    if (isHomePage) {
      const baseStyles = getNavbarStyles(currentSection);
      if (activeDropdown) {
        return {
          ...baseStyles,
          text: 'text-black',
          hover: 'hover:text-gray-600'
        };
      }
      return baseStyles;
    }
    return STATIC_NAVBAR_STYLES;
  }, [isClient, isHomePage, currentSection, getNavbarStyles, activeDropdown]);

  const navClassName = useMemo(() => 
    `fixed top-0 left-0 right-0 z-20 transition-all duration-500 ${styles.bg}`,
    [styles.bg]
  );

  return (
    <nav className={navClassName}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 lg:h-20 z-20 relative justify-between" >
          {/* Left Navigation Links - Fixed Width */}
          <div className="hidden lg:flex items-center justify-start gap-10 w-1/3">
            {(menuLoaded ? navLinks : []).map((link) => (
              <NavLink 
                key={link.name} 
                link={link} 
                styles={styles}
                hasDropdown={link.hasDropdown}
                isDropdownOpen={activeDropdown === link.name}
                onMouseEnter={() => handleMouseEnter(link.name)}
                onMouseLeave={handleMouseLeave}
              />
            ))}
          </div>

          {/* Mobile Menu Button - Only visible on mobile */}
          <div className="lg:hidden flex justify-start w-1/3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMobileMenu();
              }}
              className={`${styles.text} ${styles.hover} transition-colors duration-200 touch-manipulation`}
              style={{ touchAction: 'manipulation' }}
            >
              {isMobileMenuOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>

          {/* Brand Logo - Center Section */}
          <div className="flex justify-center items-center w-1/4">
            <a href="/" className="text-center">
              <h1 className={`text-2xl lg:text-3xl font-serif ${styles.text} tracking-wider transition-all duration-500 ease-out`}>
                REVER
              </h1>
            </a>
          </div>

          {/* Right side - Blog, About, Wishlist, Shopping Cart and User Account - Fixed Width */}
          <div className="hidden lg:flex items-center justify-end w-2/5 space-x-4">
          <a
              href="/lookbook"
              className={`text-xs font-light uppercase tracking-widest ${styles.text} ${styles.hover} transition-all duration-500 ease-out`}
            >
              Lookbook
            </a>
            {/* Blog Link */}
            {/* <a
              href="/blog"
              className={`text-xs font-light uppercase tracking-widest ${styles.text} ${styles.hover} transition-all duration-500 ease-out`}
            >
              Blog
            </a> */}
            {/* About Link */}
            <a
              href="/about"
              className={`text-xs font-light uppercase tracking-widest ${styles.text} ${styles.hover} transition-all duration-500 ease-out`}
            >
              About Us
            </a>
            <a
              href="/contact"
              className={`text-xs font-light uppercase tracking-widest ${styles.text} ${styles.hover} transition-all duration-500 ease-out`}
            >
              Contact Us
            </a>
            {isAuthenticated ? (
              <UserDropdown styles={styles} />
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className={`${styles.text} ${styles.hover} transition-all duration-500 ease-out flex items-center space-x-2`}
              >
                <User className="w-5 h-5" />
                <span className="text-sm">Sign In</span>
              </button>
            )}
            <WishlistIntegration styles={styles} />
            <button 
              onClick={() => setIsCartOpen(true)}
              className={`${styles.text} ${styles.hover} transition-all duration-500 ease-out relative group`}
            >
              <div className="relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <div className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 shadow-sm border border-white">
                  {getItemCount()}
                </div>
              </div>
            </button>
          </div>

          {/* Mobile Shopping Cart - Only visible on mobile */}
          <div className="lg:hidden flex justify-end w-1/3">
            <button 
              onClick={() => setIsCartOpen(true)}
              className={`${styles.text} ${styles.hover} transition-all duration-500 ease-out relative group`}
            >
              <div className="relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <div className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 shadow-sm border border-white">
                  {getItemCount()}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Desktop Dropdown */}
        {activeDropdown && (
          <div className="hidden lg:block">
            {(() => {
              const activeLink = (menuLoaded ? navLinks : []).find(link => link.name === activeDropdown);
              if (activeLink && activeLink.hasDropdown) {
                return (
                  <DropdownMenu
                    items={activeLink.dropdownItems}
                    styles={styles}
                    isOpen={true}
                    onMouseEnter={() => handleMouseEnter(activeDropdown)}
                    onMouseLeave={handleMouseLeave}
                  />
                );
              }
              return null;
            })()}
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden fixed top-0 left-0 w-full h-full bg-gray-50/90 backdrop-blur-sm z-[9999] overflow-hidden"
            style={{
              animation: 'slideInFromTop 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards'
            }}
            onClick={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            onScroll={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="mx-0 px-4 sm:px-6 lg:px-8 flex-shrink-0">
                <div className="flex justify-between items-center h-16 lg:h-20 z-20 relative">
                  <div className="lg:hidden flex justify-center lg:justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMobileMenu();
                      }}
                      className="text-black hover:text-gray-600 transition-all duration-500 ease-out touch-manipulation"
                      style={{ touchAction: 'manipulation' }}
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="flex-1 flex justify-center lg:justify-center">
                    <a href="/" className="text-center">
                      <h1 className="text-2xl lg:text-3xl font-serif text-black tracking-wider transition-all duration-500 ease-out">
                        REVER
                      </h1>
                    </a>
                  </div>

                  <div className="lg:hidden flex items-center justify-center">
                    <button 
                      onClick={() => {
                        setIsCartOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-black hover:text-gray-600 transition-all duration-500 ease-out relative group"
                    >
                      <div className="relative">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <div className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 shadow-sm border border-white">
                          {getItemCount()}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            
              {/* Mobile Navigation */}
              <div 
                className="flex-1 overflow-y-auto" 
                style={{ WebkitOverflowScrolling: 'touch' }}
                onWheel={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onTouchMove={(e) => {
                  e.stopPropagation();
                }}
              >
                <div className="p-6 space-y-8">
                  {/* User Account Section */}
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                      Account
                    </h3>
                    {isAuthenticated ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <a href="/account/profile" className="block text-sm text-gray-700 hover:text-gray-900 py-2">
                            Profile
                          </a>
                          <a href="/account/orders" className="block text-sm text-gray-700 hover:text-gray-900 py-2">
                            Orders
                          </a>
                          <a href="/account/addresses" className="block text-sm text-gray-700 hover:text-gray-900 py-2">
                            Addresses
                          </a>
                          <a href="/account/settings" className="block text-sm text-gray-700 hover:text-gray-900 py-2">
                            Settings
                          </a>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          setIsAuthModalOpen(true);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left text-sm text-gray-700 hover:text-gray-900 py-2 flex items-center space-x-2"
                      >
                        <User className="w-4 h-4" />
                        <span>Sign In / Sign Up</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                      Collections
                    </h3>
                    {(menuLoaded ? navLinks : []).map((link) => (
                      <MobileNavLink 
                        key={link.name} 
                        link={link} 
                        styles={{ text: 'text-black', hover: 'hover:text-gray-600' }}
                        hasDropdown={link.hasDropdown}
                        isDropdownOpen={mobileDropdowns[link.name]}
                        onToggle={() => toggleMobileDropdown(link.name)}
                      />
                    ))}
                    {/* Blog Link for Mobile */}
                    <a
                      href="/lookbook"
                      className="block text-sm font-light uppercase tracking-widest text-black hover:text-gray-600 transition-colors duration-200 py-2"
                    >
                      Lookbook
                    </a>
                    {/* <a
                      href="/blog"
                      className="block text-sm font-light uppercase tracking-widest text-black hover:text-gray-600 transition-colors duration-200 py-2"
                    >
                      Blog
                    </a> */}
                    {/* About Link for Mobile */}
                    <a
                      href="/about"
                      className="block text-sm font-light uppercase tracking-widest text-black hover:text-gray-600 transition-colors duration-200 py-2"
                    >
                      About Us
                    </a>

                    <a
                      href="/contact"
                      className="block text-sm font-light uppercase tracking-widest text-black hover:text-gray-600 transition-colors duration-200 py-2"
                    >
                      Contact Us
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <style jsx>{`
              @keyframes slideInFromTop {
                0% {
                  opacity: 0;
                }
                100% {
                  opacity: 1;
                }
              }
            `}</style>
          </div>
        )}

        {/* Cart Dropdown */}
        <CartDropdown 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
        />

        {/* Auth Modal */}
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
      </div>
    </nav>
  );
}
