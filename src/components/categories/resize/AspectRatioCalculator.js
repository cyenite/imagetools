import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';

const AspectRatioCalculator = () => {
    const [originalImage, setOriginalImage] = useState(null);
    const [previewDimensions, setPreviewDimensions] = useState({ width: 0, height: 0 });
    const [targetRatio, setTargetRatio] = useState(null);
    const [originalDimensions, setOriginalDimensions] = useState(null);
    const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);

    const navigate = useNavigate();

    const commonRatios = [
        { name: '1:1 Square', ratio: 1 },
        { name: '4:3 Standard', ratio: 4 / 3 },
        { name: '16:9 Widescreen', ratio: 16 / 9 },
        { name: '3:2 Classic', ratio: 3 / 2 },
        { name: '9:16 Story', ratio: 9 / 16 },
        { name: '21:9 Ultrawide', ratio: 21 / 9 }
    ];

    // Handle file upload using react-dropzone
    const onDrop = useCallback(acceptedFiles => {
        const file = acceptedFiles[0]; // Only take the first file
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    setOriginalDimensions({ width: img.width, height: img.height });
                    setPreviewDimensions({ width: img.width, height: img.height });
                    // Clear any existing target ratio when new image is uploaded
                    setTargetRatio(null);
                };
                img.src = e.target.result;
                setOriginalImage(e.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            toast.error('Please upload a valid image file');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
        },
        multiple: false
    });

    // Handle ratio selection
    const handleRatioSelect = (ratio) => {
        setTargetRatio(ratio);
        if (originalDimensions) {
            // Calculate new dimensions while maintaining the selected ratio
            const currentArea = originalDimensions.width * originalDimensions.height;

            // Try to maintain similar area while applying new ratio
            let newWidth = Math.sqrt(currentArea * ratio);
            let newHeight = newWidth / ratio;

            // Round to nearest pixel
            newWidth = Math.round(newWidth);
            newHeight = Math.round(newHeight);

            setPreviewDimensions({ width: newWidth, height: newHeight });
        }
    };

    // Handle manual dimension changes
    const handleDimensionChange = (dimension, value) => {
        const numValue = parseInt(value) || 0;

        if (maintainAspectRatio) {
            // Existing logic for maintaining aspect ratio
            if (targetRatio) {
                if (dimension === 'width') {
                    setPreviewDimensions({
                        width: numValue,
                        height: Math.round(numValue / targetRatio)
                    });
                } else {
                    setPreviewDimensions({
                        width: Math.round(numValue * targetRatio),
                        height: numValue
                    });
                }
            } else if (originalDimensions) {
                const originalRatio = originalDimensions.width / originalDimensions.height;
                if (dimension === 'width') {
                    setPreviewDimensions({
                        width: numValue,
                        height: Math.round(numValue / originalRatio)
                    });
                } else {
                    setPreviewDimensions({
                        width: Math.round(numValue * originalRatio),
                        height: numValue
                    });
                }
            }
        } else {
            // Allow free resizing when aspect ratio is not maintained
            setPreviewDimensions(prev => ({
                ...prev,
                [dimension]: numValue
            }));
        }
    };

    // Calculate current aspect ratio
    const getCurrentRatio = () => {
        if (!previewDimensions.width || !previewDimensions.height) return null;
        const ratio = previewDimensions.width / previewDimensions.height;
        return ratio.toFixed(3);
    };

    // Reset to original dimensions
    const handleReset = () => {
        if (originalDimensions) {
            setPreviewDimensions({ ...originalDimensions });
            setTargetRatio(null);
            toast.success('Reset to original dimensions');
        }
    };

    // Add this new function to calculate preview styles
    const getPreviewStyles = () => {
        if (!previewDimensions.width || !previewDimensions.height) return {};

        const containerWidth = 800;  // Maximum preview container width
        const containerHeight = 600; // Maximum preview container height

        // Calculate the aspect ratio
        const imageRatio = previewDimensions.width / previewDimensions.height;
        const containerRatio = containerWidth / containerHeight;

        let scale;
        if (imageRatio > containerRatio) {
            // If image is wider than container ratio, scale based on width
            scale = containerWidth / previewDimensions.width;
        } else {
            // If image is taller than container ratio, scale based on height
            scale = containerHeight / previewDimensions.height;
        }

        // Ensure we never scale up, only down if needed
        scale = Math.min(scale, 1);

        return {
            width: `${previewDimensions.width}px`,
            height: `${previewDimensions.height}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'center',
        };
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 pt-16 relative">
            {/* Background Effects */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-gray-900/50 to-transparent dark:from-gray-950/50 pointer-events-none" />

            <div className="absolute inset-x-0 top-0 h-[50vh] pointer-events-none">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute -top-48 -left-48 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
                    <div className="absolute -top-48 -right-48 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
                    <div className="absolute top-[-20vh] left-[20vw] w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
                </div>

                <div className="absolute inset-0 opacity-50 dark:opacity-40"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgb(59 130 246 / 0.3) 2px, transparent 0)`,
                        backgroundSize: '32px 32px'
                    }}
                />

                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white dark:via-gray-900/50 dark:to-gray-900" />
            </div>

            <div className="container mx-auto px-4 py-24 relative">
                <div className="max-w-6xl mx-auto">
                    {/* Title Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 mb-6">
                            Aspect Ratio Calculator
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Preview how your image will look like in a different aspect ration device, and calculate perfect dimensions for your images
                        </p>
                    </div>

                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
                        {/* Original Dimensions Display */}
                        {originalDimensions && (
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Original Dimensions:
                                        </span>
                                        <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                                            {originalDimensions.width}×{originalDimensions.height}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Current Ratio:
                                        </span>
                                        <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                                            {getCurrentRatio()}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleReset}
                                        className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        Reset to Original
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Image Upload/Preview */}
                        <div className="mb-8">
                            {!originalImage ? (
                                <div {...getRootProps()} className={`relative rounded-2xl p-12 text-center transition-all
                                    group hover:bg-blue-50/50 dark:hover:bg-blue-900/20
                                    before:absolute before:inset-0 before:rounded-2xl before:border-2 
                                    before:border-dashed before:border-gray-300 dark:before:border-gray-600
                                    before:pointer-events-none
                                    ${isDragActive ? 'before:border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : ''}`}>
                                    <input {...getInputProps()} />
                                    <div className="relative z-10">
                                        <div className="space-y-6">
                                            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 
                                                p-[1px] group-hover:scale-110 transition-transform duration-300">
                                                <div className="w-full h-full rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center">
                                                    <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xl text-gray-700 dark:text-gray-300 font-medium">
                                                    {isDragActive ? 'Drop your image here' : 'Drag and drop your image here'}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                                    or
                                                </p>
                                            </div>
                                            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 
                                                hover:from-blue-600 hover:to-purple-700 
                                                text-white rounded-xl transition-all shadow-lg hover:shadow-xl
                                                font-medium group-hover:scale-105 duration-300">
                                                Browse Files
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Preview Container */}
                                    <div className="relative bg-gray-50 dark:bg-gray-800/50 rounded-2xl overflow-hidden">
                                        {/* Grid Background */}
                                        <div className="absolute inset-0">
                                            <div className="absolute inset-0 opacity-50 dark:opacity-40"
                                                style={{
                                                    backgroundImage: `radial-gradient(circle at 1px 1px, rgb(59 130 246 / 0.3) 2px, transparent 0)`,
                                                    backgroundSize: '32px 32px'
                                                }}
                                            />
                                        </div>

                                        {/* Preview Area */}
                                        <div className="relative flex items-center justify-center p-4"
                                            style={{ height: '60vh' }}>
                                            <div className="relative transition-all duration-300 ease-in-out">
                                                <div style={getPreviewStyles()}>
                                                    <img
                                                        src={originalImage}
                                                        alt="Preview"
                                                        className={`w-full h-full ${maintainAspectRatio ? 'object-contain' : 'object-fill'}`}
                                                    />

                                                    {/* Dimensions Overlay */}
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-sm py-2 px-4 backdrop-blur-sm">
                                                        {previewDimensions.width} × {previewDimensions.height}
                                                    </div>

                                                    {/* Aspect Ratio Guidelines */}
                                                    <div className="absolute inset-0 border-2 border-blue-500/30 pointer-events-none" />
                                                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                                                        {[...Array(9)].map((_, i) => (
                                                            <div key={i} className="border border-blue-500/10" />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Debug info */}
                                    {originalDimensions && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                            Original: {originalDimensions.width} × {originalDimensions.height} |
                                            Current: {previewDimensions.width} × {previewDimensions.height} |
                                            Ratio: {(previewDimensions.width / previewDimensions.height).toFixed(3)}
                                        </div>
                                    )}

                                    {/* Controls Bar */}
                                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                                        {/* Current Dimensions */}
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {previewDimensions.width} × {previewDimensions.height}
                                            </span>
                                            {targetRatio && (
                                                <span className="ml-2">
                                                    (Ratio: {targetRatio.toFixed(3)})
                                                </span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={handleReset}
                                                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 
                                                    hover:text-gray-900 dark:hover:text-white transition-colors"
                                            >
                                                Reset
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setOriginalImage(null);
                                                    setOriginalDimensions(null);
                                                    setPreviewDimensions({ width: 0, height: 0 });
                                                    setTargetRatio(null);
                                                }}
                                                className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 
                                                    hover:bg-gray-200 dark:hover:bg-gray-600
                                                    text-gray-700 dark:text-gray-300 rounded-xl 
                                                    transition-all flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                                Upload New Image
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Common Ratios */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Common Aspect Ratios
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                                {commonRatios.map(ratio => (
                                    <button
                                        key={ratio.name}
                                        onClick={() => handleRatioSelect(ratio.ratio)}
                                        className={`px-4 py-2 rounded-xl text-sm transition-all
                                            ${targetRatio === ratio.ratio
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <span>{ratio.name}</span>
                                            <span className="text-xs opacity-75">{ratio.ratio.toFixed(2)}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dimensions Calculator */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-gray-700 dark:text-gray-300 font-medium">Width (px)</label>
                                <input
                                    type="number"
                                    value={previewDimensions.width}
                                    onChange={(e) => handleDimensionChange('width', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 
                                        border border-gray-200 dark:border-gray-600 rounded-xl
                                        text-gray-700 dark:text-gray-300 
                                        focus:outline-none focus:ring-2 focus:ring-blue-500 
                                        transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-gray-700 dark:text-gray-300 font-medium">Height (px)</label>
                                <input
                                    type="number"
                                    value={previewDimensions.height}
                                    onChange={(e) => handleDimensionChange('height', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 
                                        border border-gray-200 dark:border-gray-600 rounded-xl
                                        text-gray-700 dark:text-gray-300 
                                        focus:outline-none focus:ring-2 focus:ring-blue-500 
                                        transition-all"
                                />
                            </div>
                        </div>

                        {/* Add spacing */}
                        <div className="mt-8">
                            {/* Aspect Ratio Toggle */}
                            <div className="mb-6 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out bg-gray-200 dark:bg-gray-700 cursor-pointer"
                                        onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}>
                                        <div className={`inline-block h-5 w-5 transform rounded-full transition duration-200 ease-in-out bg-white shadow-md
                                            ${maintainAspectRatio ? 'translate-x-6' : 'translate-x-1'}`}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Maintain aspect ratio
                                    </span>
                                </div>

                                {!maintainAspectRatio && (
                                    <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        Image may appear distorted
                                    </div>
                                )}
                            </div>

                            {/* Understanding Aspect Ratio Section */}
                            <div className="mt-12 space-y-8">
                                <div className="text-center">
                                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                        Understanding Aspect Ratio
                                    </h2>
                                    <div className="w-20 h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full" />
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            Maintaining Aspect Ratio
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                            When enabled, this option preserves the original proportions of your image,
                                            preventing distortion. It's ideal for maintaining the natural look of photos,
                                            logos, and other visual content.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            Free Transform
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                            Disabling aspect ratio lock allows you to freely adjust width and height
                                            independently. This can be useful for specific platform requirements or
                                            creative effects, though it may distort the image.
                                        </p>
                                    </div>
                                </div>

                                {/* Pro Tips Section */}
                                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 
                                    rounded-2xl p-8 border border-blue-100 dark:border-blue-800">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                        Pro Tips for Resizing
                                    </h3>
                                    <ul className="space-y-4">
                                        <li className="flex items-start space-x-3">
                                            <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                Use <span className="font-semibold text-gray-900 dark:text-white">common ratios</span> for
                                                platform-specific content (e.g., 16:9 for YouTube, 1:1 for Instagram)
                                            </p>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                Enable <span className="font-semibold text-gray-900 dark:text-white">aspect ratio lock</span> to
                                                maintain image quality and prevent distortion
                                            </p>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                Consider <span className="font-semibold text-gray-900 dark:text-white">scaling down</span> rather
                                                than up to maintain image quality
                                            </p>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                Use <span className="font-semibold text-gray-900 dark:text-white">free transform</span> only when
                                                specific dimensions are required by your platform
                                            </p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Batch Resize CTA */}
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={() => navigate('/categories/resize/batch-resize')}
                                className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 
                                    hover:from-blue-600 hover:to-purple-700 
                                    text-white rounded-xl transition-all shadow-lg hover:shadow-xl
                                    font-medium hover:scale-105 duration-300"
                            >
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Need to resize multiple images?
                                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                                        Try Batch Resizer →
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AspectRatioCalculator; 