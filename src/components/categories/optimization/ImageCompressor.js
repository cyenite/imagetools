import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { saveAs } from 'file-saver';

const ImageCompressor = () => {
    const [image, setImage] = useState(null);
    const [compressedImage, setCompressedImage] = useState(null);
    const [error, setError] = useState(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const [compressionOptions, setCompressionOptions] = useState({
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        quality: 0.8,
        preserveExif: true
    });
    const [originalStats, setOriginalStats] = useState(null);
    const [compressedStats, setCompressedStats] = useState(null);

    const compressImage = useCallback(async () => {
        if (!image || isCompressing) return;

        try {
            setIsCompressing(true);
            setError(null);

            const compressedFile = await imageCompression(image, compressionOptions);

            // Get compressed image stats
            const compressedSize = (compressedFile.size / (1024 * 1024)).toFixed(2);
            const compressedUrl = URL.createObjectURL(compressedFile);

            const compressedImg = new Image();
            compressedImg.onload = () => {
                setCompressedStats({
                    size: compressedSize,
                    dimensions: `${compressedImg.width}×${compressedImg.height}`,
                    type: compressedFile.type
                });
            };
            compressedImg.src = compressedUrl;

            setCompressedImage(compressedFile);
        } catch (err) {
            setError('Failed to compress image');
            console.error(err);
        } finally {
            setIsCompressing(false);
        }
    }, [image, compressionOptions, isCompressing]);

    const onDrop = useCallback(acceptedFiles => {
        setError(null);
        const file = acceptedFiles[0];

        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        // Get original image stats
        const originalSize = (file.size / (1024 * 1024)).toFixed(2);
        const img = new Image();
        img.onload = () => {
            setOriginalStats({
                size: originalSize,
                dimensions: `${img.width}×${img.height}`,
                type: file.type
            });
        };
        img.src = URL.createObjectURL(file);

        setImage(file);
        setCompressedImage(null);
        setCompressedStats(null);
    }, []);

    const handleDownload = useCallback(() => {
        if (!compressedImage) return;

        const filename = image.name.replace(/\.[^/.]+$/, "");
        const extension = compressedImage.type.split('/')[1];
        saveAs(compressedImage, `${filename}_compressed.${extension}`);
    }, [compressedImage, image]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        },
        multiple: false
    });

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
                <div className="max-w-6xl mx-auto">
                    {/* Title Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 mb-6">
                            Image Compressor
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Optimize your images for the web while maintaining quality
                        </p>
                    </div>

                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
                        {/* Compression Controls */}
                        <div className="mb-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Max Size Control */}
                                <div className="space-y-2">
                                    <label className="text-gray-700 dark:text-gray-300 font-medium">
                                        Max Size (MB)
                                    </label>
                                    <input
                                        type="number"
                                        min="0.1"
                                        max="10"
                                        step="0.1"
                                        value={compressionOptions.maxSizeMB}
                                        onChange={(e) => setCompressionOptions(prev => ({
                                            ...prev,
                                            maxSizeMB: parseFloat(e.target.value)
                                        }))}
                                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 
                                            border border-gray-200 dark:border-gray-600 rounded-xl
                                            text-gray-700 dark:text-gray-300 
                                            focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Max Width/Height Control */}
                                <div className="space-y-2">
                                    <label className="text-gray-700 dark:text-gray-300 font-medium">
                                        Max Dimension (px)
                                    </label>
                                    <input
                                        type="number"
                                        min="100"
                                        max="8000"
                                        step="100"
                                        value={compressionOptions.maxWidthOrHeight}
                                        onChange={(e) => setCompressionOptions(prev => ({
                                            ...prev,
                                            maxWidthOrHeight: parseInt(e.target.value)
                                        }))}
                                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 
                                            border border-gray-200 dark:border-gray-600 rounded-xl
                                            text-gray-700 dark:text-gray-300 
                                            focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Quality Control */}
                                <div className="space-y-2">
                                    <label className="text-gray-700 dark:text-gray-300 font-medium">
                                        Quality (0-1)
                                    </label>
                                    <input
                                        type="number"
                                        min="0.1"
                                        max="1"
                                        step="0.1"
                                        value={compressionOptions.quality}
                                        onChange={(e) => setCompressionOptions(prev => ({
                                            ...prev,
                                            quality: parseFloat(e.target.value)
                                        }))}
                                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 
                                            border border-gray-200 dark:border-gray-600 rounded-xl
                                            text-gray-700 dark:text-gray-300 
                                            focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Preserve EXIF Toggle */}
                                <div className="space-y-2">
                                    <label className="text-gray-700 dark:text-gray-300 font-medium">
                                        Preserve EXIF Data
                                    </label>
                                    <div className="relative inline-block w-full">
                                        <input
                                            type="checkbox"
                                            checked={compressionOptions.preserveExif}
                                            onChange={(e) => setCompressionOptions(prev => ({
                                                ...prev,
                                                preserveExif: e.target.checked
                                            }))}
                                            className="sr-only peer"
                                            id="preserve-exif"
                                        />
                                        <label
                                            htmlFor="preserve-exif"
                                            className="flex items-center justify-between p-2.5 w-full bg-white dark:bg-gray-700 
                                                border border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer
                                                text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600
                                                transition-colors"
                                        >
                                            <span className="mr-3">{compressionOptions.preserveExif ? 'Yes' : 'No'}</span>
                                            <span className={`w-9 h-5 bg-gray-200 rounded-full peer dark:bg-gray-700 
                                                peer-checked:after:translate-x-full peer-checked:after:border-white 
                                                after:content-[''] after:absolute after:top-[14px] after:right-[10px] 
                                                after:bg-white after:border-gray-300 after:border after:rounded-full 
                                                after:h-4 after:w-4 after:transition-all dark:border-gray-600 
                                                peer-checked:bg-blue-600`}>
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dropzone Area */}
                        {!image ? (
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
                                <div className="relative z-10">
                                    <input {...getInputProps()} />
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
                            <div className="mt-8 space-y-8">
                                {/* Image Preview */}
                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Original Image Preview */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Original Image
                                            </h3>
                                            <div {...getRootProps()}>
                                                <input {...getInputProps()} />
                                                <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 
                                                    hover:from-blue-600 hover:to-purple-700
                                                    text-white rounded-xl transition-all duration-300 
                                                    flex items-center gap-2 hover:scale-105">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                    </svg>
                                                    Upload New Image
                                                </button>
                                            </div>
                                        </div>
                                        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 p-[1px]">
                                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl overflow-hidden">
                                                <img
                                                    src={URL.createObjectURL(image)}
                                                    alt="Original"
                                                    className="max-w-full h-auto"
                                                />
                                            </div>
                                        </div>
                                        {originalStats && (
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Size</p>
                                                    <p className="text-gray-900 dark:text-white font-medium">{originalStats.size} MB</p>
                                                </div>
                                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Dimensions</p>
                                                    <p className="text-gray-900 dark:text-white font-medium">{originalStats.dimensions}</p>
                                                </div>
                                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Type</p>
                                                    <p className="text-gray-900 dark:text-white font-medium">{originalStats.type.split('/')[1].toUpperCase()}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Compressed Image Preview */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Compressed Image
                                            </h3>
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={compressImage}
                                                    disabled={isCompressing}
                                                    className={`px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 
                                                        hover:from-blue-600 hover:to-purple-700
                                                        text-white rounded-xl transition-all duration-300 
                                                        flex items-center gap-2 hover:scale-105
                                                        ${isCompressing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    {isCompressing ? (
                                                        <>
                                                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                            </svg>
                                                            Compressing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                                    d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                                            </svg>
                                                            Compress
                                                        </>
                                                    )}
                                                </button>
                                                {compressedImage && (
                                                    <button
                                                        onClick={handleDownload}
                                                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 
                                                            hover:from-green-600 hover:to-emerald-700
                                                            text-white rounded-xl transition-all duration-300 
                                                            flex items-center gap-2 hover:scale-105"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                        Download
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 p-[1px]">
                                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl overflow-hidden">
                                                {compressedImage && (
                                                    <div className="relative group">
                                                        <img
                                                            src={URL.createObjectURL(compressedImage)}
                                                            alt="Compressed"
                                                            className="max-w-full h-auto"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {compressedStats && (
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Size</p>
                                                    <p className="text-gray-900 dark:text-white font-medium">{compressedStats.size} MB</p>
                                                </div>
                                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Dimensions</p>
                                                    <p className="text-gray-900 dark:text-white font-medium">{compressedStats.dimensions}</p>
                                                </div>
                                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Type</p>
                                                    <p className="text-gray-900 dark:text-white font-medium">{compressedStats.type.split('/')[1].toUpperCase()}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
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

            {/* Educational Section */}
            <div className="container mx-auto px-4 py-24">
                <div className="max-w-4xl mx-auto space-y-16">
                    {/* Understanding Image Compression */}
                    <div className="space-y-8">
                        <div className="text-center">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Understanding Image Compression
                            </h2>
                            <div className="w-20 h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    What is Image Compression?
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Image compression reduces file size while maintaining acceptable visual quality. It works by
                                    removing redundant data and optimizing the image's data structure, making it more efficient
                                    for web use and storage.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Lossy vs. Lossless
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Our compression uses lossy techniques, which achieve better compression ratios by selectively
                                    discarding data. The quality input lets you control this trade-off between file size and
                                    visual quality.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Compression Settings Explained */}
                    <div className="space-y-8">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                            Understanding Compression Settings
                        </h3>

                        <div className="grid gap-6">
                            {/* Quality Setting Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            Quality Setting (0-1)
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                            Controls the compression level. Higher values (closer to 1) preserve more detail but result
                                            in larger files. Lower values (closer to 0) achieve smaller files but may introduce visible artifacts.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Dimensions Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            Maximum Dimensions
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                            Limits the image's maximum width or height while maintaining aspect ratio. Reducing dimensions
                                            can significantly decrease file size while keeping the image suitable for web use.
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
                            Pro Tips for Image Compression
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3">
                                <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Start with a <span className="font-semibold text-gray-900 dark:text-white">quality setting of 0.8</span> for
                                    a good balance between size and quality
                                </p>
                            </li>
                            <li className="flex items-start space-x-3">
                                <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-600 dark:text-gray-400">
                                    For web images, keep dimensions under <span className="font-semibold text-gray-900 dark:text-white">1920 pixels</span> unless
                                    you specifically need larger sizes
                                </p>
                            </li>
                            <li className="flex items-start space-x-3">
                                <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Toggle <span className="font-semibold text-gray-900 dark:text-white">EXIF preservation</span> off
                                    if you don't need metadata to further reduce file size
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default ImageCompressor;
