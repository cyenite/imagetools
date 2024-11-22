import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { toast } from 'react-hot-toast';
import SEOHead from '../../common/SEOHead';

const COMMON_PRESETS = {
    social: [
        { name: 'Instagram Square', width: 1080, height: 1080 },
        { name: 'Instagram Portrait', width: 1080, height: 1350 },
        { name: 'Instagram Landscape', width: 1080, height: 566 },
        { name: 'Facebook Post', width: 1200, height: 630 },
        { name: 'Twitter Post', width: 1600, height: 900 },
        { name: 'LinkedIn Post', width: 1200, height: 627 },
    ],
    appStores: [
        { name: 'App Store Icon', width: 1024, height: 1024 },
        { name: 'App Store Screenshot (6.5")', width: 1242, height: 2688 },
        { name: 'Play Store Icon', width: 512, height: 512 },
        { name: 'Play Store Feature', width: 1024, height: 500 },
    ],
    devices: [
        { name: 'iPhone 14 Pro', width: 1179, height: 2556 },
        { name: 'iPad Pro 12.9"', width: 2048, height: 2732 },
        { name: 'MacBook Pro 16"', width: 3456, height: 2234 },
        { name: 'Desktop 4K', width: 3840, height: 2160 },
    ],
    icons: [
        { name: 'Favicon', width: 32, height: 32 },
        { name: 'Small Icon', width: 64, height: 64 },
        { name: 'Medium Icon', width: 128, height: 128 },
        { name: 'Large Icon', width: 256, height: 256 },
    ]
};

const resizeImage = (file, config) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
            let newWidth = config.width;
            let newHeight = config.height;

            // Calculate dimensions if maintaining aspect ratio
            if (config.maintainAspectRatio) {
                const aspectRatio = img.width / img.height;
                if (newWidth / newHeight > aspectRatio) {
                    newWidth = newHeight * aspectRatio;
                } else {
                    newHeight = newWidth / aspectRatio;
                }
            }

            // Set canvas dimensions
            canvas.width = newWidth;
            canvas.height = newHeight;

            // Draw resized image
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            // Convert to blob
            canvas.toBlob(
                (blob) => {
                    resolve({
                        blob,
                        name: file.name,
                        originalSize: file.size,
                        newSize: blob.size,
                        dimensions: {
                            original: { width: img.width, height: img.height },
                            new: { width: newWidth, height: newHeight }
                        }
                    });
                },
                `image/${config.format}`,
                config.quality / 100
            );
        };

        img.onerror = () => {
            reject(new Error(`Failed to load image: ${file.name}`));
        };

        // Read the file as data URL
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.onerror = () => {
            reject(new Error(`Failed to read file: ${file.name}`));
        };
        reader.readAsDataURL(file);
    });
};

const BatchResizer = () => {
    const [files, setFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [resizeConfig, setResizeConfig] = useState({
        width: 1080,
        height: 1080,
        maintainAspectRatio: true,
        format: 'jpeg',
        quality: 90
    });
    const [setProcessedFiles] = useState([]);
    const [progress, setProgress] = useState(0);
    const [selectedPreset, setSelectedPreset] = useState(null);
    const [originalDimensions, setOriginalDimensions] = useState(null);

    const onDrop = useCallback(acceptedFiles => {
        setError(null);
        const imageFiles = acceptedFiles.filter(file => file.type.startsWith('image/'));

        if (imageFiles.length === 0) {
            setError('Please upload valid image files');
            return;
        }

        // Get dimensions of the first image
        const img = new Image();
        const url = URL.createObjectURL(imageFiles[0]);

        img.onload = () => {
            setOriginalDimensions({ width: img.width, height: img.height });

            // Only update dimensions if no preset is selected
            if (!selectedPreset) {
                setResizeConfig(prev => ({
                    ...prev,
                    width: img.width,
                    height: img.height
                }));
            }

            URL.revokeObjectURL(url);
        };

        img.src = url;
        setFiles(imageFiles);
    }, [selectedPreset]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
        },
        multiple: true
    });

    const handleResize = async () => {
        if (files.length === 0) return;

        setIsProcessing(true);
        setError(null);
        setProgress(0);
        setProcessedFiles([]);

        try {
            const zip = new JSZip();
            const results = [];

            // Process each file
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                try {
                    const result = await resizeImage(file, resizeConfig);

                    // Add to zip
                    const fileName = result.name.replace(/\.[^/.]+$/, "") +
                        `_${result.dimensions.new.width}x${result.dimensions.new.height}.${resizeConfig.format}`;
                    zip.file(fileName, result.blob);

                    results.push({
                        name: fileName,
                        originalSize: result.originalSize,
                        newSize: result.newSize,
                        dimensions: result.dimensions
                    });

                    // Update progress
                    const newProgress = ((i + 1) / files.length) * 100;
                    setProgress(newProgress);
                    setProcessedFiles(prev => [...prev, results[i]]);

                } catch (err) {
                    console.error(`Error processing ${file.name}:`, err);
                    toast.error(`Failed to process ${file.name}`);
                }
            }

            // Generate and download zip
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            saveAs(zipBlob, `resized_images_${Date.now()}.zip`);

            // Show success message
            toast.success(`Successfully processed ${results.length} images`, {
                duration: 5000,
                style: {
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: '#fff',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    borderRadius: '12px',
                    padding: '12px 24px',
                },
            });

        } catch (err) {
            setError('Failed to process images');
            toast.error('Failed to process images');
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    const handlePresetSelect = (preset) => {
        setSelectedPreset(preset);
        setResizeConfig(prev => ({
            ...prev,
            width: preset.width,
            height: preset.height,
            maintainAspectRatio: false
        }));
    };

    const handleDimensionChange = (dimension, value) => {
        // Clear selected preset when dimensions are manually changed
        setSelectedPreset(null);

        if (!originalDimensions) return;

        const numValue = parseInt(value);
        if (resizeConfig.maintainAspectRatio) {
            const aspectRatio = originalDimensions.width / originalDimensions.height;
            if (dimension === 'width') {
                setResizeConfig(prev => ({
                    ...prev,
                    width: numValue,
                    height: Math.round(numValue / aspectRatio)
                }));
            } else {
                setResizeConfig(prev => ({
                    ...prev,
                    height: numValue,
                    width: Math.round(numValue * aspectRatio)
                }));
            }
        } else {
            setResizeConfig(prev => ({
                ...prev,
                [dimension]: numValue
            }));
        }
    };

    return (
        <>
            <SEOHead
                title="Batch Image Resizer - Resize Multiple Images at Once"
                description="Resize multiple images at once with our powerful batch processing tool"
                canonicalUrl="/categories/resize"
            />
            <div className="min-h-screen bg-white dark:bg-gray-900 pt-16 relative">
                {/* Background Effects */}
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
                <div className="absolute inset-x-0 top-0 h-[50vh] pointer-events-none">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute -top-48 -left-48 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
                        <div className="absolute -top-48 -right-48 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
                        <div className="absolute top-[-20vh] left-[20vw] w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white dark:via-gray-900/50 dark:to-gray-900" />
                </div>

                <div className="container mx-auto px-4 py-24 relative">
                    <div className="max-w-6xl mx-auto">
                        {/* Title Section */}
                        <div className="text-center mb-16">
                            <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 mb-6">
                                Batch Resizer
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                Resize multiple images at once with our powerful batch processing tool
                            </p>
                        </div>

                        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
                            {/* Resize Controls */}
                            <div className="mb-8 space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-gray-700 dark:text-gray-300 font-medium">Width (px)</label>
                                        <input
                                            type="number"
                                            value={resizeConfig.width}
                                            onChange={(e) => handleDimensionChange('width', e.target.value)}
                                            className={`w-full px-4 py-2.5 bg-white dark:bg-gray-700 
                                            border border-gray-200 dark:border-gray-600 rounded-xl
                                            text-gray-700 dark:text-gray-300 
                                            focus:outline-none focus:ring-2 focus:ring-blue-500 
                                            transition-all ${selectedPreset ? 'border-blue-500 dark:border-blue-400' : ''}`}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-gray-700 dark:text-gray-300 font-medium">Height (px)</label>
                                        <input
                                            type="number"
                                            value={resizeConfig.height}
                                            onChange={(e) => handleDimensionChange('height', e.target.value)}
                                            className={`w-full px-4 py-2.5 bg-white dark:bg-gray-700 
                                            border border-gray-200 dark:border-gray-600 rounded-xl
                                            text-gray-700 dark:text-gray-300 
                                            focus:outline-none focus:ring-2 focus:ring-blue-500 
                                            transition-all ${selectedPreset ? 'border-blue-500 dark:border-blue-400' : ''}`}
                                        />
                                    </div>
                                </div>

                                {/* Maintain Aspect Ratio Toggle */}
                                <div className="flex items-center justify-between">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={resizeConfig.maintainAspectRatio}
                                            onChange={(e) => {
                                                if (!selectedPreset) {
                                                    setResizeConfig(prev => ({
                                                        ...prev,
                                                        maintainAspectRatio: e.target.checked
                                                    }));
                                                }
                                            }}
                                            disabled={!!selectedPreset}
                                        />
                                        <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                                        peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer 
                                        dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white 
                                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                                        after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
                                        after:transition-all dark:border-gray-600 peer-checked:bg-blue-600
                                        ${selectedPreset ? 'opacity-50' : ''}`}>
                                        </div>
                                        <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Maintain Aspect Ratio
                                        </span>
                                    </label>

                                    {selectedPreset && (
                                        <div className="mt-4 flex items-start space-x-2">
                                            <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            <div>
                                                <p className="text-blue-600 dark:text-blue-400">
                                                    Using {selectedPreset.name} preset ({selectedPreset.width}×{selectedPreset.height})
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        setSelectedPreset(null);
                                                        if (originalDimensions) {
                                                            setResizeConfig(prev => ({
                                                                ...prev,
                                                                width: originalDimensions.width,
                                                                height: originalDimensions.height,
                                                                maintainAspectRatio: true
                                                            }));
                                                        }
                                                    }}
                                                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 
                                                    dark:hover:text-gray-200 underline mt-1"
                                                >
                                                    Clear preset
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Preset Sizes */}
                            <div className="mb-8">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {Object.entries(COMMON_PRESETS).map(([category, presets]) => (
                                        <div key={category} className="space-y-3">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                                                {category}
                                            </h3>
                                            <div className="space-y-2">
                                                {presets.map((preset) => (
                                                    <button
                                                        key={preset.name}
                                                        onClick={() => handlePresetSelect(preset)}
                                                        className={`w-full px-4 py-2 rounded-xl text-sm transition-all
                                                        ${selectedPreset?.name === preset.name
                                                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                                                : 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                            }
                                                    `}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <span>{preset.name}</span>
                                                            <span className="text-xs opacity-75">
                                                                {preset.width}×{preset.height}
                                                            </span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Original Dimensions Display */}
                            {originalDimensions && (
                                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Original Dimensions:
                                        </span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {originalDimensions.width}×{originalDimensions.height}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Dropzone */}
                            <div
                                {...getRootProps()}
                                className={`relative rounded-2xl p-12 text-center transition-all
                                group hover:bg-blue-50/50 dark:hover:bg-blue-900/20
                                before:absolute before:inset-0 before:rounded-2xl before:border-2 before:border-dashed
                                before:pointer-events-none
                                ${isDragActive
                                        ? 'before:border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                                        : 'before:border-gray-300 dark:before:border-gray-600'
                                    }
                            `}
                            >
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
                                                {isDragActive ? 'Drop your images here' : 'Drag and drop your images here'}
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

                            {/* File List */}
                            {files.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Selected Files ({files.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {files.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                                <span className="text-gray-700 dark:text-gray-300">{file.name}</span>
                                                <span className="text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleResize}
                                        disabled={isProcessing}
                                        className={`mt-6 w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 
                                        hover:from-green-600 hover:to-emerald-700
                                        text-white rounded-xl transition-all shadow-lg hover:shadow-xl
                                        font-medium ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} duration-300
                                        flex items-center justify-center gap-2`}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Processing Images...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Resize Images
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Processing Progress */}
                            {isProcessing && (
                                <div className="mt-6 space-y-4">
                                    <div className="w-full bg-blue-500 rounded-full h-4">
                                        <div className="w-full bg-blue-200 rounded-full h-4" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        Processing...
                                    </div>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Add this educational section after the main resizer component */}
                <div className="container mx-auto px-4 py-24">
                    <div className="max-w-4xl mx-auto space-y-16">
                        {/* Understanding Batch Resizing */}
                        <div className="space-y-8">
                            <div className="text-center">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                    Understanding Batch Resizing
                                </h2>
                                <div className="w-20 h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        What is Batch Resizing?
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        Batch resizing allows you to resize multiple images simultaneously to the same dimensions.
                                        This is particularly useful when preparing images for social media, e-commerce platforms,
                                        or maintaining consistent image sizes across your website.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Aspect Ratio Preservation
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        Maintaining aspect ratio prevents image distortion by scaling width and height proportionally.
                                        This ensures your images look natural while meeting size requirements for various platforms.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Common Use Cases */}
                        <div className="space-y-8">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                                Common Use Cases
                            </h3>

                            <div className="grid gap-6">
                                {/* Social Media Card */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                Social Media Posts
                                            </h4>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                                Quickly resize images to meet platform-specific requirements for Instagram,
                                                Facebook, Twitter, and LinkedIn. Use our presets for perfect dimensions every time.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* App Store Card */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                App Store Assets
                                            </h4>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                                Prepare all your app store screenshots and icons in one go. Our presets include
                                                dimensions for both Apple App Store and Google Play Store requirements.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pro Tips Section */}
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 
                        rounded-2xl p-8 border border-blue-100 dark:border-blue-800">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                Pro Tips for Batch Resizing
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex items-start space-x-3">
                                    <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Use <span className="font-semibold text-gray-900 dark:text-white">platform presets</span> to
                                        ensure your images meet exact requirements
                                    </p>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Enable <span className="font-semibold text-gray-900 dark:text-white">aspect ratio lock</span> to
                                        prevent image distortion
                                    </p>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Process images in <span className="font-semibold text-gray-900 dark:text-white">bulk</span> to
                                        save time when preparing multiple assets
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BatchResizer;
