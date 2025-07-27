'use client';

import { useState, useContext, createContext, useMemo, useCallback } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

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
    text: 'text-black',
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

  const getNavbarStyles = useCallback((section) => {
    return NAVBAR_STYLES[section] || NAVBAR_STYLES.default;
  }, []);

  const contextValue = useMemo(() => ({
    currentSection,
    setCurrentSection,
    getNavbarStyles
  }), [currentSection, getNavbarStyles]);

  return (
    <NavbarContext.Provider value={contextValue}>
      {children}
    </NavbarContext.Provider>
  );
};

// Memoized link components to prevent unnecessary re-renders
const NavLink = ({ link, styles }) => (
  <a
    href={link.href}
    className={`text-xs font-light uppercase tracking-wider ${styles.text} ${styles.hover} transition-colors duration-200`}
  >
    {link.name}
  </a>
);

const MobileNavLink = ({ link, styles }) => (
  <a
    href={link.href}
    className={`block text-sm font-light uppercase tracking-wider ${styles.text} ${styles.hover} transition-colors duration-200 py-2`}
  >
    {link.name}
  </a>
);

export default function Navbar() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  
  const { currentSection, getNavbarStyles } = useNavbar();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  // Use dynamic styles only on home page, static black styles on other pages
  const styles = useMemo(() => {
    if (isHomePage) {
      return getNavbarStyles(currentSection);
    }
    return STATIC_NAVBAR_STYLES;
  }, [isHomePage, currentSection, getNavbarStyles]);

  const navLinks = useMemo(() => [
    { name: 'HIGHLIGHTS', href: '/highlights' },
    { name: 'WOMEN', href: '/women' },
    { name: 'MEN', href: '/men' },
    { name: 'SL PRODUCTIONS', href: '/sl-productions' },
  ], []);

  const rightNavLinks = useMemo(() => [
    { name: 'LA MAISON', href: '/la-maison' },
    { name: 'STORES', href: '/stores' },
    { name: 'SERVICES', href: '/services' },
    { name: 'LOGIN', href: '/login' },
  ], []);

  const navClassName = useMemo(() => 
    `fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${styles.bg}`,
    [styles.bg]
  );

  return (
    <nav className={navClassName}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Left Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <NavLink key={link.name} link={link} styles={styles} />
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className={`${styles.text} ${styles.hover} transition-colors duration-200`}
            >
              {isMobileMenuOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-1 flex justify-center lg:justify-center">
            <a href="/" className="text-center">
              <h1 className={`text-2xl lg:text-3xl font-serif ${styles.text} tracking-wider`}>
                <span className="text-3xl lg:text-4xl">S</span>AINT LAURENT
              </h1>
            </a>
          </div>

          {/* Right Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8">
            {rightNavLinks.map((link) => (
              <NavLink key={link.name} link={link} styles={styles} />
            ))}
            <button className={`${styles.text} ${styles.hover} transition-colors duration-200`}>
              <Search size={18} />
            </button>
          </div>

          {/* Search Icon for Mobile */}
          <div className="lg:hidden">
            <button className={`${styles.text} ${styles.hover} transition-colors duration-200`}>
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className={`px-2 pt-2 pb-3 space-y-1 ${styles.bg} border-t ${isHomePage ? 'border-white/20' : 'border-white/20'}`}>
              {/* Left Links */}
              <div className="space-y-2 mb-4">
                {navLinks.map((link) => (
                  <MobileNavLink key={link.name} link={link} styles={styles} />
                ))}
              </div>
              
              {/* Right Links */}
              <div className="space-y-2">
                {rightNavLinks.map((link) => (
                  <MobileNavLink key={link.name} link={link} styles={styles} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 