const Tab = ({ children, label }) => {
    return (
        <div className="min-h-[100px] py-2">
            {/* Tab Content with Modern Styling */}
            <div className="prose prose-gray dark:prose-invert max-w-none">
                {children}
            </div>
        </div>
    );
};

export default Tab; 