import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import GridCropper from './GridCropper';
import AspectRatioCalculator from './AspectRatioCalculator';
import BatchResizer from './BatchResizer';
import CircleCropper from './CircleCropper';

const ResizeTools = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const tools = [
        {
            title: "Grid Cropper",
            description: "Crop images in a grid",
            icon: "📏",
            to: "grid-cropper"
        },
        {
            title: "Batch Resize",
            description: "Resize multiple images at once",
            icon: "📦",
            to: "batch-resize"
        },
        {
            title: "Crop Circle",
            description: "Crop images into perfect circles",
            icon: "⭕",
            to: "crop-circle"
        },
        {
            title: "Aspect Ratio",
            description: "Calculate and resize with perfect ratios",
            icon: "📐",
            to: "aspect-ratio"
        }
    ];

    const filteredTools = tools.filter(tool =>
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 pt-16 relative">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-gray-900/50 to-transparent dark:from-gray-950/50 pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-[50vh] pointer-events-none">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute -top-48 -left-48 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
                    <div className="absolute -top-48 -right-48 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
                    <div className="absolute top-[-20vh] left-[20vw] w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
                </div>
                <div
                    className="absolute inset-0 opacity-50 dark:opacity-40"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgb(59 130 246 / 0.3) 2px, transparent 0)`,
                        backgroundSize: '32px 32px'
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white dark:via-gray-900/50 dark:to-gray-900" />
            </div>

            <div className="container mx-auto px-4 py-24 relative">
                <h1 className="text-4xl font-bold text-slate-800 mb-8 text-center">
                    Image Resizing Tools
                </h1>

                <div className="mb-8 max-w-md mx-auto">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search tools..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-white shadow-md 
                                     focus:ring-2 focus:ring-blue-500 focus:outline-none
                                     pl-10 transition-all duration-300"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                            🔍
                        </span>
                    </div>
                </div>

                <div className="tool-grid">
                    <Routes>
                        <Route index element={
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {filteredTools.map((tool, index) => (
                                    <ToolCard
                                        key={index}
                                        {...tool}
                                    />
                                ))}
                                {filteredTools.length === 0 && (
                                    <div className="col-span-full text-center text-slate-600 py-8">
                                        No tools found matching your search.
                                    </div>
                                )}
                            </div>
                        } />
                        <Route path="grid-cropper" element={<GridCropper />} />
                        <Route path="batch-resize" element={<BatchResizer />} />
                        <Route path="crop-circle" element={<CircleCropper />} />
                        <Route path="aspect-ratio" element={<AspectRatioCalculator />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

const ToolCard = ({ title, description, icon, to }) => (
    <Link
        to={to}
        className="block p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
    >
        <div className="text-4xl mb-4">{icon}</div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">{title}</h2>
        <p className="text-slate-600">{description}</p>
    </Link>
);

export default ResizeTools; 