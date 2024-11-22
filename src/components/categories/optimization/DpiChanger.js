import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { saveAs } from 'file-saver';

const DpiChanger = () => {
    const [processingFiles, setProcessingFiles] = useState([]);
    const [error, setError] = useState(null);
    const [targetDpi, setTargetDpi] = useState(300);
    const [preview, setPreview] = useState(null);
    const [originalDpi, setOriginalDpi] = useState(null);
    const [currentFile, setCurrentFile] = useState(null);

    const processImage = useCallback(async (file) => {
        if (!file) return;

        try {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Calculate new dimensions based on target DPI
                const scaleFactor = targetDpi / 96;
                canvas.width = img.width * scaleFactor;
                canvas.height = img.height * scaleFactor;

                // Draw image with new DPI
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Convert to blob and create preview URL
                canvas.toBlob((blob) => {
                    // If there's an existing processed preview, revoke its URL
                    if (preview?.processed) {
                        URL.revokeObjectURL(preview.processed);
                    }

                    const previewUrl = URL.createObjectURL(blob);
                    setPreview(prev => ({
                        original: prev?.original || url,
                        processed: previewUrl,
                        blob: blob,
                        filename: `${file.name.split('.')[0]}_${targetDpi}dpi.${file.name.split('.').pop()}`
                    }));

                    setProcessingFiles(prev => prev.map((f) =>
                        f.name === file.name ? { ...f, status: 'completed', progress: 100 } : f
                    ));
                }, file.type);
            };

            img.src = url;
        } catch (err) {
            setError(`Error processing image: ${err.message}`);
            setProcessingFiles(prev => prev.map((f) =>
                f.name === file.name ? { ...f, status: 'error', progress: 0 } : f
            ));
        }
    }, [targetDpi, preview]);

    const onDrop = useCallback(async (acceptedFiles) => {
        setError(null);
        setPreview(null);

        const imageFiles = acceptedFiles.filter(file => file.type.startsWith('image/'));
        if (imageFiles.length === 0) {
            setError('Please select valid image files');
            return;
        }

        const file = imageFiles[0];
        setCurrentFile(file);
        setProcessingFiles([{ name: file.name, status: 'processing', progress: 0 }]);
        processImage(file);
    }, [processImage]);

    useEffect(() => {
        if (currentFile) {
            processImage(currentFile);
        }
    }, [targetDpi, processImage, currentFile]);

    const handleDownload = () => {
        if (preview?.blob) {
            saveAs(preview.blob, preview.filename);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        }
    });

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview.original);
                URL.revokeObjectURL(preview.processed);
            }
        };
    }, [preview]);

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
                    {/* Modern Title Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 mb-6">
                            DPI Changer
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Adjust image DPI for perfect print quality with our intuitive tool
                        </p>
                    </div>

                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
                        {/* DPI Input */}
                        <div className="mb-8">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-center">
                                <label className="text-gray-700 dark:text-gray-300 font-medium min-w-[120px]">
                                    Target DPI:
                                </label>
                                <input
                                    type="number"
                                    value={targetDpi}
                                    onChange={(e) => setTargetDpi(Math.max(1, parseInt(e.target.value) || 0))}
                                    className="w-full max-w-[200px] px-4 py-2.5 bg-white dark:bg-gray-700 
                                        border border-gray-200 dark:border-gray-600 rounded-xl
                                        text-gray-700 dark:text-gray-300 
                                        focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {!preview ? (
                            // Modern Dropzone
                            <div {...getRootProps()} className={`relative rounded-2xl p-12 text-center transition-all
                                group hover:bg-blue-50/50 dark:hover:bg-blue-900/20
                                before:absolute before:inset-0 before:rounded-2xl before:border-2 before:border-dashed
                                before:pointer-events-none
                                ${isDragActive
                                    ? 'before:border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                                    : 'before:border-gray-300 dark:before:border-gray-600'
                                }
                            `}>
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
                            // Preview Section
                            <div className="mt-8 space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Original Image */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Original Image
                                        </h3>
                                        <div className="relative rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-700">
                                            <img
                                                src={preview.original}
                                                alt="Original"
                                                className="w-full h-auto"
                                            />
                                            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                                                96 DPI
                                            </div>
                                        </div>
                                    </div>

                                    {/* Processed Image */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Processed Image ({targetDpi} DPI)
                                        </h3>
                                        <div className="relative rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-700">
                                            <img
                                                src={preview.processed}
                                                alt="Processed"
                                                className="w-full h-auto"
                                            />
                                            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                                                {targetDpi} DPI
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={() => {
                                            setPreview(null);
                                            setProcessingFiles([]);
                                        }}
                                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 
                                            dark:hover:bg-gray-600 rounded-xl transition-colors duration-200"
                                    >
                                        Process Another Image
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 
                                            hover:from-blue-600 hover:to-purple-700 text-white rounded-xl 
                                            transition-all shadow-lg hover:shadow-xl"
                                    >
                                        Download Image
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
                                {error}
                            </div>
                        )}

                        {/* Processing Files List */}
                        {processingFiles.length > 0 && (
                            <div className="mt-8 space-y-4">
                                {processingFiles.map((file, index) => (
                                    <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-700 dark:text-gray-300">{file.name}</span>
                                            <span className={`text-sm ${file.status === 'completed' ? 'text-green-500' :
                                                file.status === 'error' ? 'text-red-500' :
                                                    'text-blue-500'
                                                }`}>
                                                {file.status === 'completed' ? 'Done' :
                                                    file.status === 'error' ? 'Error' :
                                                        'Processing...'}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${file.status === 'completed' ? 'bg-green-500' :
                                                    file.status === 'error' ? 'bg-red-500' :
                                                        'bg-blue-500'
                                                    }`}
                                                style={{ width: `${file.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Information Sections */}
            <div className="container mx-auto px-4 py-24">
                <div className="max-w-4xl mx-auto space-y-16">
                    {/* Understanding DPI Section */}
                    <div className="space-y-8">
                        <div className="text-center">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Understanding DPI
                            </h2>
                            <div className="w-20 h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full" />
                        </div>

                        {/* DPI Explanation Content */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">What is DPI?</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    DPI (Dots Per Inch) refers to the number of printed dots within one inch of an image.
                                    Higher DPI means more detail and better print quality, but also larger file sizes.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Why Change DPI?</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Different printing purposes require different DPI settings. Professional printing often
                                    needs higher DPI for sharp results, while web images can use lower DPI to reduce file size.
                                </p>
                            </div>
                        </div>

                        {/* Common DPI Values Section */}
                        <div className="mt-12 space-y-6">
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Common DPI Values</h3>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-xl">
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">72-96 DPI</h4>
                                    <p className="text-gray-600 dark:text-gray-400">Standard for web images and digital displays</p>
                                </div>
                                <div className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-xl">
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">300 DPI</h4>
                                    <p className="text-gray-600 dark:text-gray-400">Professional printing, magazines, and brochures</p>
                                </div>
                                <div className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-xl">
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">600+ DPI</h4>
                                    <p className="text-gray-600 dark:text-gray-400">High-quality photo prints and detailed artwork</p>
                                </div>
                            </div>
                        </div>

                        {/* Pro Tips Section */}
                        <div className="mt-12 space-y-6">
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Pro Tips</h3>
                            <ul className="space-y-4 text-gray-600 dark:text-gray-400">
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-500">•</span>
                                    Always check your printer's recommended DPI settings
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-500">•</span>
                                    Higher DPI doesn't always mean better quality - match it to your needs
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-500">•</span>
                                    Consider file size when choosing DPI for multiple prints
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DpiChanger;
