'use client';

import { useState, useContext, createContext, useMemo, useCallback } from 'react';
import { Search, Menu, X, ChevronDown } from 'lucide-react';
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
              {item.title && (
                <h3 className="text-xs font-bold uppercase tracking-widest text-black mb-6">
                  {item.title}
                </h3>
              )}
              <div className="space-y-3">
                {item.links.map((link, linkIndex) => (
                  <a
                    key={linkIndex}
                    href={link.href}
                    className="block text-sm uppercase tracking-widest text-black hover:text-gray-500 transition-colors duration-200 py-1 font-light"
                  >
                    {link.name}
                  </a>
                ))}
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
            {item.title && (
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                {item.title}
              </h4>
            )}
            <div className="space-y-1">
              {item.links.map((link, linkIndex) => (
                <a
                  key={linkIndex}
                  href={link.href}
                  className={`block text-sm ${styles.text} ${styles.hover} transition-colors duration-200 py-1 pl-2`}
                >
                  {link.name}
                </a>
              ))}
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
  const isHomePage = pathname === '/';
  
  const { currentSection, getNavbarStyles, activeDropdown, setActiveDropdown } = useNavbar();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileDropdowns, setMobileDropdowns] = useState({});
  const [hoverTimeout, setHoverTimeout] = useState(null);

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

  // Use dynamic styles only on home page, static black styles on other pages
  const styles = useMemo(() => {
    if (isHomePage) {
      const baseStyles = getNavbarStyles(currentSection);
      // Override text color to black when dropdown is active
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
  }, [isHomePage, currentSection, getNavbarStyles, activeDropdown]);

  const navLinks = useMemo(() => [
    { 
      name: 'HIGHLIGHTS', 
      href: '/highlights',
      hasDropdown: true,
      dropdownItems: [
        {
          title: 'FEATURED',
          links: [
            { name: 'NEW ARRIVALS', href: '/highlights/new-arrivals' },
            { name: 'BEST SELLERS', href: '/highlights/best-sellers' },
            { name: 'TRENDING', href: '/highlights/trending' }
          ]
        },
        {
          title: 'COLLECTIONS',
          links: [
            { name: 'SPRING/SUMMER 2024', href: '/highlights/spring-summer-2024' },
            { name: 'FALL/WINTER 2024', href: '/highlights/fall-winter-2024' },
            { name: 'LIMITED EDITION', href: '/highlights/limited-edition' }
          ]
        }
      ]
    },
    { 
      name: 'WOMEN', 
      href: '/women',
      hasDropdown: true,
      dropdownItems: [
        {
          title: 'CLOTHING',
          links: [
            { name: 'DRESSES', href: '/women/dresses' },
            { name: 'TOPS', href: '/women/tops' },
            { name: 'BOTTOMS', href: '/women/bottoms' },
            { name: 'OUTERWEAR', href: '/women/outerwear' }
          ]
        },
        {
          title: 'ACCESSORIES',
          links: [
            { name: 'BAGS', href: '/women/bags' },
            { name: 'SHOES', href: '/women/shoes' },
            { name: 'JEWELRY', href: '/women/jewelry' },
            { name: 'SCARVES', href: '/women/scarves' }
          ]
        }
      ]
    },
    { 
      name: 'MEN', 
      href: '/men',
      hasDropdown: true,
      dropdownItems: [
        {
          title: 'CLOTHING',
          links: [
            { name: 'SHIRTS', href: '/men/shirts' },
            { name: 'PANTS', href: '/men/pants' },
            { name: 'SUITS', href: '/men/suits' },
            { name: 'OUTERWEAR', href: '/men/outerwear' }
          ]
        },
        {
          title: 'ACCESSORIES',
          links: [
            { name: 'BAGS', href: '/men/bags' },
            { name: 'SHOES', href: '/men/shoes' },
            { name: 'BELTS', href: '/men/belts' },
            { name: 'TIES', href: '/men/ties' }
          ]
        }
      ]
    },
    { 
      name: 'SL PRODUCTIONS', 
      href: '/sl-productions',
      hasDropdown: true,
      dropdownItems: [
        {
          title: 'SL PRODUCTIONS',
          links: [
            { name: 'ABOUT', href: '/sl-productions/about' }
          ]
        },
        {
          title: '2024',
          links: [
            { name: 'FABRICE DU WELZ', href: '/sl-productions/fabrice-du-welz' },
            { name: 'JACQUES AUDIARD', href: '/sl-productions/jacques-audiard' },
            { name: 'DAVID CRONENBERG', href: '/sl-productions/david-cronenberg' },
            { name: 'PAOLO SORRENTINO', href: '/sl-productions/paolo-sorrentino' }
          ]
        },
        {
          title: '2023',
          links: [
            { name: 'PEDRO ALMODÓVAR', href: '/sl-productions/pedro-almodovar' },
            { name: 'JEAN-LUC GODARD', href: '/sl-productions/jean-luc-godard' }
          ]
        },
        {
          title: '2020',
          links: [
            { name: 'ABEL FERRARA', href: '/sl-productions/abel-ferrara' }
          ]
        },
        {
          title: '2019',
          links: [
            { name: 'WONG KAR WAI', href: '/sl-productions/wong-kar-wai' },
            { name: 'GASPAR NOÉ', href: '/sl-productions/gaspar-noe' },
            { name: 'BRET EASTON ELLIS', href: '/sl-productions/bret-easton-ellis' }
          ]
        }
      ]
    },
  ], []);

  const rightNavLinks = useMemo(() => [
    { 
      name: 'LA MAISON', 
      href: '/la-maison',
      hasDropdown: true,
      dropdownItems: [
        {
          title: 'ABOUT',
          links: [
            { name: 'OUR STORY', href: '/la-maison/our-story' },
            { name: 'HERITAGE', href: '/la-maison/heritage' },
            { name: 'CRAFTSMANSHIP', href: '/la-maison/craftsmanship' }
          ]
        },
        {
          title: 'EXPERIENCE',
          links: [
            { name: 'BOUTIQUES', href: '/la-maison/boutiques' },
            { name: 'PERSONAL SHOPPING', href: '/la-maison/personal-shopping' },
            { name: 'VIP SERVICES', href: '/la-maison/vip-services' }
          ]
        }
      ]
    },
    { 
      name: 'STORES', 
      href: '/stores',
      hasDropdown: true,
      dropdownItems: [
        {
          title: 'LOCATIONS',
          links: [
            { name: 'FIND A STORE', href: '/stores/find' },
            { name: 'FLAGSHIP STORES', href: '/stores/flagship' },
            { name: 'BOUTIQUES', href: '/stores/boutiques' }
          ]
        },
        {
          title: 'SERVICES',
          links: [
            { name: 'PERSONAL STYLING', href: '/stores/personal-styling' },
            { name: 'ALTERATIONS', href: '/stores/alterations' },
            { name: 'GIFT SERVICES', href: '/stores/gift-services' }
          ]
        }
      ]
    },
    { 
      name: 'SERVICES', 
      href: '/services',
      hasDropdown: true,
      dropdownItems: [
        {
          title: 'CUSTOMER CARE',
          links: [
            { name: 'CONTACT US', href: '/services/contact' },
            { name: 'RETURNS & EXCHANGES', href: '/services/returns' },
            { name: 'SIZE GUIDE', href: '/services/size-guide' }
          ]
        },
        {
          title: 'PERSONALIZATION',
          links: [
            { name: 'MONOGRAMMING', href: '/services/monogramming' },
            { name: 'CUSTOM ORDERS', href: '/services/custom-orders' },
            { name: 'GIFT WRAPPING', href: '/services/gift-wrapping' }
          ]
        }
      ]
    },
    { name: 'LOGIN', href: '/login' },
  ], []);

  const navClassName = useMemo(() => 
    `fixed top-0 left-0 right-0 z-20 transition-all duration-500 ${styles.bg}`,
    [styles.bg]
  );

  return (
    <nav className={navClassName}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20 z-20 relative" >
          {/* Left Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
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

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex justify-center lg:justify-center">
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

          {/* Brand Logo */}
          <div className="flex-1 flex justify-center lg:justify-center">
            <a href="/" className="text-center">
              <h1 className={`text-2xl lg:text-3xl font-serif ${styles.text} tracking-wider transition-all duration-500 ease-out`}>
                <span className="text-3xl lg:text-4xl">S</span>AINT LAURENT
              </h1>
            </a>
          </div>

          {/* Right Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8">
            {rightNavLinks.map((link) => (
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
            <button className={`${styles.text} ${styles.hover} transition-all duration-500 ease-out`}>
              <Search size={18} />
            </button>
          </div>

          {/* Search Icon for Mobile */}
          <div className="lg:hidden flex items-center justify-center">
            <button className={`${styles.text} ${styles.hover} transition-colors duration-200`}>
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* Desktop Dropdown */}
        {activeDropdown && (
          <div className="hidden lg:block">
            {(() => {
              const activeLink = [...navLinks, ...rightNavLinks].find(link => link.name === activeDropdown);
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
          >
            <div className="flex flex-col h-full">
              {/* Mobile Header - Same structure as main navbar */}
              <div className="mx-0 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 lg:h-20 z-20 relative">
                  {/* Mobile Menu Button - Now Close Button */}
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

                  {/* Brand Logo */}
                  <div className="flex-1 flex justify-center lg:justify-center">
                    <a href="/" className="text-center">
                      <h1 className="text-2xl lg:text-3xl font-serif text-black tracking-wider transition-all duration-500 ease-out">
                        <span className="text-3xl lg:text-4xl">S</span>AINT LAURENT
                      </h1>
                    </a>
                  </div>

                  {/* Search Icon for Mobile */}
                  <div className="lg:hidden flex items-center justify-center">
                    <button className="text-black hover:text-gray-600 transition-all duration-500 ease-out">
                      <Search size={20} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Mobile Navigation */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-8">
                  {/* Left Links */}
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                      Collections
                    </h3>
                    {navLinks.map((link) => (
                      <MobileNavLink 
                        key={link.name} 
                        link={link} 
                        styles={{ text: 'text-black', hover: 'hover:text-gray-600' }}
                        hasDropdown={link.hasDropdown}
                        isDropdownOpen={mobileDropdowns[link.name]}
                        onToggle={() => toggleMobileDropdown(link.name)}
                      />
                    ))}
                  </div>
                  
                  {/* Right Links */}
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                      Services
                    </h3>
                    {rightNavLinks.map((link) => (
                      <MobileNavLink 
                        key={link.name} 
                        link={link} 
                        styles={{ text: 'text-black', hover: 'hover:text-gray-600' }}
                        hasDropdown={link.hasDropdown}
                        isDropdownOpen={mobileDropdowns[link.name]}
                        onToggle={() => toggleMobileDropdown(link.name)}
                      />
                    ))}
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
      </div>
    </nav>
  );
} 