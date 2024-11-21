import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiImage, FiCrop, FiZap, FiEdit2, FiLayers,
  FiPenTool, FiRefreshCw, FiSearch, FiArrowRight, FiGithub, FiStar
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const Home = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    {
      title: "Image Conversion",
      icon: <FiRefreshCw />,
      path: "/conversion",
      isPremium: false,
      tools: [
        { name: "HEIC Converter", path: "/categories/conversion/heic-converter", available: true },
        { name: "Image Format Converter", path: "/categories/conversion/format-converter", available: true },
        { name: "Image to PDF", path: "/categories/conversion/image-to-pdf", available: true, isPremium: true },
        { name: "SVG to PNG/JPG", path: "/categories/conversion/svg-to-raster", available: true },
      ]
    },
    {
      title: "Resizing Tools",
      icon: <FiCrop />,
      path: "/resize",
      tools: [
        { name: "Grid Cropper", path: "/categories/resize/grid-cropper", available: true, isPremium: true },
        { name: "Batch Resizer", path: "/categories/resize/batch-resize", available: true, isPremium: true },
        { name: "Crop to Circle", path: "/categories/resize/crop-circle", available: true },
        { name: "Aspect Ratio Calculator", path: "/categories/resize/aspect-ratio", available: true },
      ]
    },
    {
      title: "Optimization",
      icon: <FiZap />,
      tools: [
        { name: "Image Compressor", path: "/compress", available: false, isPremium: true },
        { name: "Image Optimizer", path: "/optimize", available: false, isPremium: true },
        { name: "DPI Changer", path: "/dpi", available: false, isPremium: true },
      ]
    },
    {
      title: "Enhancement",
      icon: <FiEdit2 />,
      tools: [
        { name: "Background Remover", path: "/remove-bg", available: false, isPremium: true },
        { name: "Image Enhancer", path: "/enhance", available: false, isPremium: true },
        { name: "Blur/Unblur Tool", path: "/blur", available: false, isPremium: true },
      ]
    },
    {
      title: "Batch Processing",
      icon: <FiLayers />,
      tools: [
        { name: "Batch Processor", path: "/batch", available: false, isPremium: true },
        { name: "Batch Renamer", path: "/rename", available: false, isPremium: true },
        { name: "Batch Format Converter", path: "/batch-convert", available: false, isPremium: true },
      ]
    },
    {
      title: "Annotation & Markup",
      icon: <FiPenTool />,
      tools: [
        { name: "Watermarker", path: "/watermark", available: false },
        { name: "Annotation Tool", path: "/annotate", available: false, isPremium: true },
        { name: "Image Captioner", path: "/caption", available: false, isPremium: true },
      ]
    },
    {
      title: "Special Generators",
      icon: <FiImage />,
      tools: [
        { name: "Meme Generator", path: "/meme", available: false },
        { name: "Collage Maker", path: "/collage", available: false, isPremium: true },
        { name: "Thumbnail Maker", path: "/thumbnail", available: false, isPremium: true },
        { name: "QR Code Generator", path: "/qr", available: false },
      ]
    },
  ];

  const filteredCategories = categories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.tools.some(tool =>
      tool.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleCategoryClick = (category) => {
    const hasAvailableTools = category.tools.some(tool => tool.available);

    if (!hasAvailableTools) {
      toast(`${category.title} category is under active development`, {
        duration: 3000,
        style: {
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderRadius: '12px',
          padding: '12px 24px',
          fontSize: '0.875rem',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
        icon: '🚧',
      });
      return;
    }

    navigate(`/categories${category.path}`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-900 dark:to-purple-900">
        <div className="absolute inset-0 bg-grid-white/[0.2] bg-grid-16" />
        <div className="relative container mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            ImageTools<span className="text-yellow-400">.xyz</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 animate-fade-in-delay">
            Your complete toolkit for modern image manipulation
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative animate-fade-in-delay-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tools..."
                className="w-full px-6 py-4 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FiSearch className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white/70 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <div
              key={category.title}
              onClick={() => handleCategoryClick(category)}
              className={`group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700 ${category.tools.some(tool => tool.available) ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'
                }`}
            >
              {/* Card Header - More compact and modern */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="text-blue-500 dark:text-blue-400">
                    {category.icon}
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {category.title}
                  </h2>
                </div>
              </div>

              {/* Tools List - Modern compact layout */}
              <div className="p-2">
                {category.tools.map((tool) => (
                  <div
                    key={tool.name}
                    className="text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!tool.available) {
                        toast(`${tool.name} is coming soon!`, {
                          duration: 3000,
                          style: {
                            background: 'rgba(0, 0, 0, 0.8)',
                            color: '#fff',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            borderRadius: '12px',
                            padding: '12px 24px',
                            fontSize: '0.875rem',
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.12)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                          },
                          icon: '🚧',
                        });
                      }
                    }}
                  >
                    {tool.available ? (
                      <Link
                        to={tool.path}
                        className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 group/tool"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-gray-700 dark:text-gray-300 truncate flex items-center gap-2">
                          {tool.name}
                          {tool.isPremium && (
                            <FiStar className="text-yellow-400 w-4 h-4" />
                          )}
                        </span>
                        <FiArrowRight className="w-4 h-4 text-blue-500 opacity-0 group-hover/tool:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                      </Link>
                    ) : (
                      <div className="flex items-center justify-between px-2 py-1.5 cursor-not-allowed">
                        <span className="text-gray-400 dark:text-gray-500 truncate mr-2">
                          {tool.name}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 whitespace-nowrap flex-shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mr-1"></span>
                          Soon
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">ImageTools.xyz</h3>
              <p className="text-gray-600 dark:text-gray-400">Your complete toolkit for modern image manipulation</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/pricing" className="text-gray-600 dark:text-gray-400 hover:text-blue-500">Pricing</Link></li>
                <li><Link to="/changelog" className="text-gray-600 dark:text-gray-400 hover:text-blue-500">Changelog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link to="/api/docs" className="text-gray-600 dark:text-gray-400 hover:text-blue-500">Documentation</Link></li>
                <li><Link to="/api/playground" className="text-gray-600 dark:text-gray-400 hover:text-blue-500">API Playground</Link></li>
                <li><Link to="/blog" className="text-gray-600 dark:text-gray-400 hover:text-blue-500">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-blue-500">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-600 dark:text-gray-400 hover:text-blue-500">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-600 dark:text-gray-400">© 2024 Cyenite. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="https://github.com/cyenite/imagetools" className="text-gray-400 hover:text-gray-500" aria-label="GitHub">
                  <FiGithub className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
