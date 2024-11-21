import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import heic2any from 'heic2any';
import gifshot from 'gifshot';

const FormatConverter = () => {
    const [convertingFiles, setConvertingFiles] = useState([]);
    const [error, setError] = useState(null);
    const [selectedFormat, setSelectedFormat] = useState('image/jpeg');

    const formatOptions = {
        'image/jpeg': { ext: 'jpg', label: 'JPG', mimeType: 'image/jpeg' },
        'image/png': { ext: 'png', label: 'PNG', mimeType: 'image/png' },
        'image/webp': { ext: 'webp', label: 'WebP', mimeType: 'image/webp' },
        'image/gif': { ext: 'gif', label: 'GIF', mimeType: 'image/gif' },
        'image/bmp': { ext: 'bmp', label: 'BMP', mimeType: 'image/bmp' },
        'image/tiff': { ext: 'tiff', label: 'TIFF', mimeType: 'image/tiff' }
    };

    const convertImage = async (file) => {
        return new Promise((resolve, reject) => {
            if (selectedFormat === 'image/gif') {
                gifshot.createGIF({
                    images: [URL.createObjectURL(file)],
                    gifWidth: 800,
                    gifHeight: 800,
                    numFrames: 1,
                    frameDuration: 1,
                    sampleInterval: 10,
                    progressCallback: (captureProgress) => {
                        // Optional: Handle progress
                    },
                }, function (obj) {
                    if (!obj.error) {
                        const base64 = obj.image.split(',')[1];
                        const blob = base64ToBlob(base64, 'image/gif');
                        resolve(blob);
                    } else {
                        reject(new Error('GIF conversion failed'));
                    }
                });
            } else {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Conversion failed'));
                        }
                    }, selectedFormat, 0.9);
                };
                img.onerror = () => {
                    reject(new Error('Failed to load image'));
                };
                img.src = URL.createObjectURL(file);
            }
        });
    };

    const base64ToBlob = (base64, type) => {
        const byteCharacters = atob(base64);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);

            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        return new Blob(byteArrays, { type });
    };

    const onDrop = useCallback(async (acceptedFiles) => {
        setError(null);

        const imageFiles = acceptedFiles.filter(file => file.type.startsWith('image/'));

        if (imageFiles.length === 0) {
            setError('Please select valid image files');
            return;
        }

        setConvertingFiles(imageFiles.map(file => ({
            name: file.name,
            status: 'converting',
            progress: 0
        })));

        imageFiles.forEach(async (file, index) => {
            try {
                const progressInterval = setInterval(() => {
                    setConvertingFiles(prev => prev.map((f, i) =>
                        i === index && f.status === 'converting'
                            ? { ...f, progress: Math.min(f.progress + 10, 90) }
                            : f
                    ));
                }, 100);

                let convertedBlob;
                if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
                    convertedBlob = await heic2any({
                        blob: file,
                        toType: selectedFormat,
                        quality: 0.9
                    });
                } else {
                    convertedBlob = await convertImage(file);
                }

                clearInterval(progressInterval);

                const url = URL.createObjectURL(convertedBlob);
                const link = document.createElement('a');
                link.href = url;
                const ext = formatOptions[selectedFormat].ext;
                link.download = `${file.name.split('.')[0]}_imagetools-xyz.${ext}`;
                link.click();

                setConvertingFiles(prev => prev.map((f, i) =>
                    i === index ? { ...f, status: 'completed', progress: 100 } : f
                ));

                URL.revokeObjectURL(url);
            } catch (err) {
                setError(`Error converting ${file.name}: ${err.message}`);
                setConvertingFiles(prev => prev.map((f, i) =>
                    i === index ? { ...f, status: 'error', progress: 0 } : f
                ));
            }
        });
    }, [selectedFormat]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.heic', '.heif']
        }
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

            {/* Main Content */}
            <div className="container mx-auto px-4 py-24 relative">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                            Image Format Converter
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400">
                            Convert images between different formats instantly
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30">
                        <div className="grid md:grid-cols-2">
                            {/* Left Side - Dropzone */}
                            <div className="p-8 md:border-r border-gray-200 dark:border-gray-700/30">
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            Upload Images
                                        </h3>
                                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                                            Drag and drop or click to select files
                                        </p>
                                    </div>

                                    <div
                                        {...getRootProps()}
                                        className={`relative rounded-2xl aspect-[4/3] flex items-center justify-center transition-all
                                            ${isDragActive
                                                ? 'bg-blue-50/50 dark:bg-blue-900/20'
                                                : 'bg-gray-50/50 dark:bg-gray-900/20'
                                            }
                                            group hover:bg-blue-50/50 dark:hover:bg-blue-900/20
                                            border-2 border-dashed border-gray-300 dark:border-gray-600
                                            hover:border-blue-500 dark:hover:border-blue-500
                                        `}
                                    >
                                        <input {...getInputProps()} />
                                        <div className="space-y-4 text-center px-4">
                                            <div className="w-16 h-16 mx-auto rounded-2xl bg-white dark:bg-gray-800 
                                                shadow-lg group-hover:shadow-xl transition-all duration-300
                                                flex items-center justify-center">
                                                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                                                    {isDragActive ? 'Drop to convert' : 'Drop your images here'}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                                    Supports JPG, PNG, WebP, GIF, HEIC
                                                </p>
                                                <button className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 
                                                    text-blue-500 rounded-xl transition-all shadow-lg hover:shadow-xl
                                                    font-medium text-sm group-hover:bg-blue-500 group-hover:text-white">
                                                    Browse Files
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side - Settings and Status */}
                            <div className="p-8 bg-gray-50/50 dark:bg-gray-900/20 rounded-r-3xl">
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            Conversion Settings
                                        </h3>
                                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                                            Choose your output format
                                        </p>
                                    </div>

                                    {/* Format Selector */}
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-3 gap-3">
                                            {Object.entries(formatOptions).map(([format, { label }]) => (
                                                <button
                                                    key={format}
                                                    onClick={() => setSelectedFormat(format)}
                                                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all
                                                        ${selectedFormat === format
                                                            ? 'bg-blue-500 text-white shadow-lg'
                                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-700'
                                                        }
                                                    `}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
                                            {error}
                                        </div>
                                    )}

                                    {/* File List */}
                                    {convertingFiles.length > 0 && (
                                        <div className="space-y-4">
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                Converting Files
                                            </h4>
                                            <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                                {convertingFiles.map((file, index) => (
                                                    <div key={index}
                                                        className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate max-w-[200px]">
                                                                {file.name}
                                                            </span>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium 
                                                                ${file.status === 'completed'
                                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                                    : file.status === 'error'
                                                                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                                                }`}
                                                            >
                                                                {file.status === 'completed'
                                                                    ? 'Completed'
                                                                    : file.status === 'error'
                                                                        ? 'Error'
                                                                        : `Converting ${file.progress}%`}
                                                            </span>
                                                        </div>

                                                        {file.status !== 'error' && (
                                                            <div className="relative w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 
                                                                        ${file.status === 'completed'
                                                                            ? 'bg-green-500'
                                                                            : 'bg-blue-500'
                                                                        }
                                                                        ${file.status === 'converting'
                                                                            ? 'animate-pulse'
                                                                            : ''
                                                                        }`}
                                                                    style={{ width: `${file.progress}%` }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add this after the main converter section */}
            <div className="container mx-auto px-4 py-24">
                <div className="max-w-4xl mx-auto space-y-16">
                    {/* Understanding HEIC Section */}
                    <div className="text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Image Format Conversion
                        </h2>
                        <div className="w-20 h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Why Convert Image Formats?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                Different image formats serve different purposes. Converting between formats helps optimize your images for specific uses, whether it's for web performance, maintaining quality, or ensuring compatibility across different platforms and devices.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Supported Formats
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                Our converter supports a wide range of formats including JPEG, PNG, WebP, GIF, BMP, TIFF, and HEIC/HEIF. Choose the format that best suits your needs while maintaining the desired balance between quality and file size.
                            </p>
                        </div>
                    </div>

                    {/* Format Comparison Section */}
                    <div className="space-y-8">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                            Choosing the Right Format
                        </h3>

                        <div className="grid gap-6">
                            {/* JPG Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            JPEG/JPG
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                            Best for photographs and complex images with many colors. Offers good compression
                                            while maintaining acceptable quality. Ideal for web use and sharing on social media.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* PNG Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            PNG
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                            Perfect for images requiring transparency or screenshots. Provides lossless compression,
                                            meaning no quality loss. Ideal for graphics, logos, and text-heavy images.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* WebP Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            WebP
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                            Modern format developed by Google. Offers superior compression for both lossy and lossless
                                            images. Great for web use, providing faster loading times while maintaining quality.
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
                            Pro Tips for Converting HEIC Files
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3">
                                <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Choose <span className="font-semibold text-gray-900 dark:text-white">JPG</span> for photos you plan to print or share on social media
                                </p>
                            </li>
                            <li className="flex items-start space-x-3">
                                <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Use <span className="font-semibold text-gray-900 dark:text-white">PNG</span> when you need to preserve image quality or transparency
                                </p>
                            </li>
                            <li className="flex items-start space-x-3">
                                <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Consider <span className="font-semibold text-gray-900 dark:text-white">WebP</span> for web-optimized images with broad browser support
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>


            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(156, 163, 175, 0.5);
                    border-radius: 3px;
                }
            `}</style>
        </div>
    );
};

export default FormatConverter;
