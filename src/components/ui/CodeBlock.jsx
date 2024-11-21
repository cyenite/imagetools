const CodeBlock = ({ language, code }) => {
    return (
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
            <code className="text-sm">{code}</code>
        </pre>
    );
};

export default CodeBlock; 