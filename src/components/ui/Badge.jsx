const Badge = ({ color = 'blue', label }) => {
    const colors = {
        blue: 'bg-blue-100 text-blue-800',
        green: 'bg-green-100 text-green-800',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[color]}`}>
            {label}
        </span>
    );
};

export default Badge; 