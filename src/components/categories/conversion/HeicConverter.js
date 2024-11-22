import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import heic2any from 'heic2any';
import SEOHead from '../../common/SEOHead';

const HeicConverter = () => {
    const [convertingFiles, setConvertingFiles] = useState([]);
    const [error, setError] = useState(null);
    const [selectedFormat, setSelectedFormat] = useState('image/jpeg');

    const formatOptions = useMemo(() => ({
        'image/jpeg': { ext: 'jpg', label: 'JPEG' },
        'image/png': { ext: 'png', label: 'PNG' },
        'image/webp': { ext: 'webp', label: 'WebP' },
        'image/gif': { ext: 'gif', label: 'GIF' }
    }), []);

    const onDrop = useCallback(async (acceptedFiles) => {
        setError(null);

        // Filter for HEIC files
        const heicFiles = acceptedFiles.filter(file =>
            file.name.toLowerCase().endsWith('.heic') ||
            file.name.toLowerCase().endsWith('.heif')
        );

        if (heicFiles.length === 0) {
            setError('Please select HEIC/HEIF files only');
            return;
        }

        // Add files to converting state with 0 progress
        setConvertingFiles(heicFiles.map(file => ({
            name: file.name,
            status: 'converting',
            progress: 0
        })));

        // Convert each file
        heicFiles.forEach(async (file, index) => {
            try {
                // Simulate progress updates
                const progressInterval = setInterval(() => {
                    setConvertingFiles(prev => prev.map((f, i) =>
                        i === index && f.status === 'converting'
                            ? { ...f, progress: Math.min(f.progress + 10, 90) }
                            : f
                    ));
                }, 100);

                const convertedBlob = await heic2any({
                    blob: file,
                    toType: selectedFormat,
                    quality: 0.9
                });

                clearInterval(progressInterval);

                // Create download link and update status to completed with 100% progress
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
    }, [formatOptions, selectedFormat]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/heic': ['.heic'],
            'image/heif': ['.heif']
        }
    });

    return (
        <>
            <SEOHead
                title="HEIC to JPG Converter - Convert iPhone Photos Online"
                description="Convert HEIC/HEIF photos from iPhone to JPG or PNG format instantly. Free online HEIC converter with high quality output."
                canonicalUrl="/categories/conversion/heic-converter"
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

                {/* Main Content */}
                <div className="container mx-auto px-4 py-24 relative">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-12">
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                                HEIC Converter
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-400">
                                Convert HEIC images to your preferred format instantly
                            </p>
                        </div>

                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                            <div className="space-y-6">
                                {/* Format Selector - Updated Styling */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <label className="text-gray-700 dark:text-gray-300 font-medium min-w-[120px]">
                                        Output Format:
                                    </label>
                                    <div className="relative flex-1 max-w-[200px]">
                                        <select
                                            value={selectedFormat}
                                            onChange={(e) => setSelectedFormat(e.target.value)}
                                            className="w-full appearance-none px-4 py-2.5 bg-white dark:bg-gray-700 
                                                border border-gray-200 dark:border-gray-600 rounded-xl
                                                text-gray-700 dark:text-gray-300 
                                                focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                transition-all cursor-pointer"
                                        >
                                            {Object.entries(formatOptions).map(([format, { label }]) => (
                                                <option key={format} value={format}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Dropzone - Updated Styling */}
                                <div
                                    {...getRootProps()}
                                    className={`relative rounded-xl p-10 text-center transition-all
                                        before:absolute before:inset-0 before:rounded-xl before:border-2 before:border-dashed
                                        before:pointer-events-none
                                        ${isDragActive
                                            ? 'before:border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                                            : 'before:border-gray-300 dark:before:border-gray-600'
                                        }
                                        after:absolute after:inset-[3px] after:rounded-xl after:border after:border-gray-200
                                        after:dark:border-gray-700 after:pointer-events-none
                                    `}
                                >
                                    <div className="relative z-10">
                                        <input {...getInputProps()} />
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 dark:bg-blue-900/30 
                                                flex items-center justify-center">
                                                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                                                    {isDragActive ? 'Drop your files here' : 'Drag and drop your HEIC files here'}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                                                    or
                                                </p>
                                            </div>
                                            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 
                                                hover:from-blue-600 hover:to-blue-700 
                                                text-white rounded-xl transition-all shadow-lg hover:shadow-xl
                                                font-medium">
                                                Browse Files
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                                        {error}
                                    </div>
                                )}

                                {/* File List */}
                                {convertingFiles.length > 0 && (
                                    <div className="space-y-3">
                                        {convertingFiles.map((file, index) => (
                                            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                        {file.name}
                                                    </span>
                                                    <span className={`px-4 py-1.5 rounded-full text-sm font-medium 
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
                                                    <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
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
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add this after the main converter section */}
                <div className="container mx-auto px-4 py-24">
                    <div className="max-w-4xl mx-auto space-y-16">
                        {/* Understanding HEIC Section */}
                        <div className="space-y-8">
                            <div className="text-center">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                    Understanding HEIC Files
                                </h2>
                                <div className="w-20 h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        What is HEIC?
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        HEIC (High Efficiency Image Container) is Apple's implementation of the HEIF (High Efficiency Image Format) standard.
                                        Introduced with iOS 11, it offers superior compression compared to JPEG while maintaining higher image quality.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Why Convert HEIC?
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        While HEIC offers excellent compression, it's not universally supported. Converting to more common formats
                                        like JPG or PNG ensures compatibility across different devices, platforms, and applications.
                                    </p>
                                </div>
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
            </div>
        </>
    );
};

export default HeicConverter;
