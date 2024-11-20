import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiImage, FiGithub } from 'react-icons/fi';
import ThemeSwitcher from './ThemeSwitcher';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
      ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-lg'
      : 'bg-transparent'
      }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <FiImage className={`text-2xl ${scrolled ? 'text-blue-600 dark:text-blue-400' : 'text-white'
              }`} />
            <span className={`font-semibold text-lg ${scrolled ? 'text-gray-900 dark:text-white' : 'text-white'
              }`}>
              ImageTools<span className="text-yellow-400">.xyz</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {/* <Link
              to="/features"
              className={`transition-colors ${scrolled
                  ? 'text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
                  : 'text-white/90 hover:text-white'
                }`}
            >
              Features
            </Link> */}

          </div>

          {/* Right Side Items */}
          <div className="flex items-center space-x-4">
            <Link
              to="/pricing"
              className={`transition-colors ${scrolled
                ? 'text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
                : 'text-white/90 hover:text-white'
                }`}
            >
              Pricing
            </Link>
            <a
              href="https://github.com/yourusername/imagetools"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${scrolled
                ? 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
                : 'bg-white/10 hover:bg-white/20'
                }`}
            >
              <FiGithub className={`w-5 h-5 ${scrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'}`} />
              <span className={scrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'}>
                Star
              </span>
            </a>
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;