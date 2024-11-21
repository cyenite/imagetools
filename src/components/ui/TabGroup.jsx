import { useState } from 'react';

const TabGroup = ({ children }) => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div>
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    {children.map((child, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveTab(index)}
                            className={`
                group relative min-w-0 flex-1 overflow-hidden py-3 px-4 
                text-sm font-medium text-center 
                focus:outline-none focus:ring-0
                ${activeTab === index
                                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }
              `}
                        >
                            <span className="flex items-center justify-center gap-2">
                                {getTabIcon(child.props.label)}
                                {child.props.label}
                            </span>

                            {/* Bottom border animation */}
                            <span
                                className={`absolute bottom-0 inset-x-0 h-0.5 transition-all duration-200 
                  ${activeTab === index ? 'bg-blue-500' : 'bg-transparent group-hover:bg-gray-200 dark:group-hover:bg-gray-700'}`}
                                aria-hidden="true"
                            />
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-4">
                {children.map((child, index) => (
                    <div
                        key={index}
                        className={`${activeTab === index ? 'block' : 'hidden'}`}
                    >
                        {child}
                    </div>
                ))}
            </div>
        </div>
    );
};

const getTabIcon = (label) => {
    const icons = {
        Parameters: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
        ),
        Example: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
        ),
        Response: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        ),
    };

    return icons[label] || null;
};

export default TabGroup; 