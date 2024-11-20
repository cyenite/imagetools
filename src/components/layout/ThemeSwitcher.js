import React from 'react';
import { FiSun, FiMoon, FiSunset } from 'react-icons/fi';
import { RiContrastLine } from 'react-icons/ri';
import { useTheme } from '../../context/ThemeContext';

const ThemeSwitcher = () => {
    const { changeTheme, theme } = useTheme();

    const themeOptions = [
        { name: 'light', icon: <FiSun />, label: 'Light' },
        { name: 'dark', icon: <FiMoon />, label: 'Dark' },
        { name: 'night', icon: <RiContrastLine />, label: 'Night' },
        { name: 'sunset', icon: <FiSunset />, label: 'Sunset' }
    ];

    return (
        <div className="relative group">
            <button
                className="p-2 rounded-full hover:bg-opacity-10 hover:bg-current transition-colors"
                aria-label="Theme switcher"
            >
                {themeOptions.find(t => t.name === theme.name)?.icon}
            </button>

            <div className="absolute right-0 mt-2 w-48 py-2 bg-surface rounded-lg shadow-xl border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {themeOptions.map((option) => (
                    <button
                        key={option.name}
                        onClick={() => changeTheme(option.name)}
                        className={`w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-opacity-10 hover:bg-current ${theme.name === option.name ? 'text-primary' : ''
                            }`}
                    >
                        <span className="text-lg">{option.icon}</span>
                        <span>{option.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ThemeSwitcher; 