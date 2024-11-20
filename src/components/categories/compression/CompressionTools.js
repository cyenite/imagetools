import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import ImageCompressor from './ImageCompressor';
import ImageOptimizer from './ImageOptimizer';
import QualityAnalyzer from './QualityAnalyzer';

const CompressionTools = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const tools = [
        {
            title: "Image Compressor",
            description: "Compress images without losing quality",
            icon: "🗜️",
            to: "compress"
        },
        {
            title: "Image Optimizer",
            description: "Optimize images for web performance",
            icon: "⚡",
            to: "optimize"
        },
        {
            title: "Quality Analyzer",
            description: "Analyze and compare image quality",
            icon: "📊",
            to: "analyze"
        }
    ];

    const filteredTools = tools.filter(tool =>
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-slate-800 mb-8 text-center">
                    Image Compression Tools
                </h1>

                {/* Search Bar */}
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        <Route path="compress" element={<ImageCompressor />} />
                        <Route path="optimize" element={<ImageOptimizer />} />
                        <Route path="analyze" element={<QualityAnalyzer />} />
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

export default CompressionTools; 