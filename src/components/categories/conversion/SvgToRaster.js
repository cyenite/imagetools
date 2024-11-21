import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const SvgToRaster = () => {
    const [convertingFiles, setConvertingFiles] = useState([]);
    const [error, setError] = useState(null);
    const [selectedFormat, setSelectedFormat] = useState('image/png');
    const [scaleMode, setScaleMode] = useState('original'); // 'original', 'custom', 'scale'
    const [customWidth, setCustomWidth] = useState(800);
    const [customHeight, setCustomHeight] = useState(600);
    const [scaleFactor, setScaleFactor] = useState(2);
    const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);

    const formatOptions = {
        'image/png': { ext: 'png', label: 'PNG' },
        'image/jpeg': { ext: 'jpg', label: 'JPG' }
    };

    const handleScaleChange = (e) => {
        setScaleMode(e.target.value);
    };

    const calculateDimensions = (originalWidth, originalHeight) => {
        switch (scaleMode) {
            case 'original':
                return { width: originalWidth, height: originalHeight };
            case 'custom':
                if (maintainAspectRatio) {
                    const aspectRatio = originalWidth / originalHeight;
                    return {
                        width: customWidth,
                        height: Math.round(customWidth / aspectRatio)
                    };
                }
                return { width: customWidth, height: customHeight };
            case 'scale':
                return {
                    width: Math.round(originalWidth * scaleFactor),
                    height: Math.round(originalHeight * scaleFactor)
                };
            default:
                return { width: originalWidth, height: originalHeight };
        }
    };

    const onDrop = useCallback(async (acceptedFiles) => {
        setError(null);

        // Filter for SVG files
        const svgFiles = acceptedFiles.filter(file =>
            file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')
        );

        if (svgFiles.length === 0) {
            setError('Please select SVG files only');
            return;
        }

        // Add files to converting state
        setConvertingFiles(svgFiles.map(file => ({
            name: file.name,
            status: 'converting',
            progress: 0
        })));

        // Convert each file
        svgFiles.forEach(async (file, index) => {
            try {
                // Read file as text first
                const reader = new FileReader();

                reader.onload = (e) => {
                    // Create a blob from the SVG content
                    const svgBlob = new Blob([e.target.result], { type: 'image/svg+xml' });
                    const svgUrl = URL.createObjectURL(svgBlob);
                    const img = new Image();

                    img.onload = () => {
                        // Calculate dimensions based on scale mode
                        const { width, height } = calculateDimensions(img.width, img.height);

                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = width;
                        canvas.height = height;

                        // Draw SVG to canvas with calculated dimensions
                        ctx.drawImage(img, 0, 0, width, height);

                        // Convert to selected format
                        canvas.toBlob((blob) => {
                            // Create download link
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            const ext = formatOptions[selectedFormat].ext;
                            link.download = `${file.name.split('.')[0]}_imagetools-xyz.${ext}`;
                            link.click();

                            // Update status
                            setConvertingFiles(prev => prev.map((f, i) =>
                                i === index ? { ...f, status: 'completed', progress: 100 } : f
                            ));

                            // Cleanup
                            URL.revokeObjectURL(url);
                            URL.revokeObjectURL(svgUrl);
                        }, selectedFormat, 1.0);
                    };

                    img.onerror = () => {
                        throw new Error('Failed to load SVG');
                    };

                    img.src = svgUrl;

                    // Simulate progress
                    const progressInterval = setInterval(() => {
                        setConvertingFiles(prev => prev.map((f, i) =>
                            i === index && f.status === 'converting'
                                ? { ...f, progress: Math.min(f.progress + 10, 90) }
                                : f
                        ));
                    }, 100);

                    setTimeout(() => clearInterval(progressInterval), 1000);
                };

                reader.onerror = () => {
                    throw new Error('Failed to read SVG file');
                };

                // Start reading the file
                reader.readAsText(file);

            } catch (err) {
                setError(`Error converting ${file.name}: ${err.message}`);
                setConvertingFiles(prev => prev.map((f, i) =>
                    i === index ? { ...f, status: 'error', progress: 0 } : f
                ));
            }
        });
    }, [selectedFormat, scaleMode, customWidth, customHeight, scaleFactor, maintainAspectRatio, formatOptions]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/svg+xml': ['.svg']
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
                            SVG to PNG/JPG Converter
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400">
                            Convert SVG files to raster formats instantly
                        </p>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                        <div className="space-y-6">
                            {/* Format Selector */}
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

                            {/* Add Scaling Options */}
                            <div className="space-y-4">
                                <label className="text-gray-700 dark:text-gray-300 font-medium">
                                    Output Size:
                                </label>
                                <div className="grid gap-4">
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="radio"
                                            id="original"
                                            value="original"
                                            checked={scaleMode === 'original'}
                                            onChange={handleScaleChange}
                                            className="text-blue-500 focus:ring-blue-500"
                                        />
                                        <label htmlFor="original" className="text-gray-600 dark:text-gray-400">
                                            Original Size
                                        </label>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="radio"
                                            id="custom"
                                            value="custom"
                                            checked={scaleMode === 'custom'}
                                            onChange={handleScaleChange}
                                            className="text-blue-500 focus:ring-blue-500"
                                        />
                                        <label htmlFor="custom" className="text-gray-600 dark:text-gray-400">
                                            Custom Size
                                        </label>
                                    </div>

                                    {scaleMode === 'custom' && (
                                        <div className="ml-7 grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm text-gray-500 dark:text-gray-400">Width (px)</label>
                                                <input
                                                    type="number"
                                                    value={customWidth}
                                                    onChange={(e) => setCustomWidth(Number(e.target.value))}
                                                    className="mt-1 w-full px-3 py-2 bg-white dark:bg-gray-700 
                                                        border border-gray-200 dark:border-gray-600 rounded-lg
                                                        text-gray-700 dark:text-gray-300"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-500 dark:text-gray-400">Height (px)</label>
                                                <input
                                                    type="number"
                                                    value={customHeight}
                                                    onChange={(e) => setCustomHeight(Number(e.target.value))}
                                                    disabled={maintainAspectRatio}
                                                    className="mt-1 w-full px-3 py-2 bg-white dark:bg-gray-700 
                                                        border border-gray-200 dark:border-gray-600 rounded-lg
                                                        text-gray-700 dark:text-gray-300 
                                                        disabled:opacity-50 disabled:cursor-not-allowed"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={maintainAspectRatio}
                                                        onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                                                        className="text-blue-500 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Maintain aspect ratio
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="radio"
                                            id="scale"
                                            value="scale"
                                            checked={scaleMode === 'scale'}
                                            onChange={handleScaleChange}
                                            className="text-blue-500 focus:ring-blue-500"
                                        />
                                        <label htmlFor="scale" className="text-gray-600 dark:text-gray-400">
                                            Scale Factor
                                        </label>
                                    </div>

                                    {scaleMode === 'scale' && (
                                        <div className="ml-7">
                                            <input
                                                type="number"
                                                value={scaleFactor}
                                                onChange={(e) => setScaleFactor(Number(e.target.value))}
                                                min="0.1"
                                                max="10"
                                                step="0.1"
                                                className="w-24 px-3 py-2 bg-white dark:bg-gray-700 
                                                    border border-gray-200 dark:border-gray-600 rounded-lg
                                                    text-gray-700 dark:text-gray-300"
                                            />
                                            <span className="ml-2 text-gray-500 dark:text-gray-400">×</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Dropzone */}
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
                                                {isDragActive ? 'Drop your files here' : 'Drag and drop your SVG files here'}
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
                                            {/* ... File list content remains the same ... */}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Educational Section */}
            <div className="container mx-auto px-4 py-24">
                <div className="max-w-4xl mx-auto space-y-16">
                    {/* Understanding SVG Section */}
                    <div className="space-y-8">
                        <div className="text-center">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Understanding SVG Files
                            </h2>
                            <div className="w-20 h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    What is SVG?
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    SVG (Scalable Vector Graphics) is a vector-based image format that uses XML to describe two-dimensional graphics.
                                    Unlike raster formats, SVGs can be scaled to any size without losing quality.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Why Convert SVG?
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    While SVG is excellent for vectors, some applications or platforms may require raster formats.
                                    Converting to PNG or JPG ensures broader compatibility and fixed dimensions for specific use cases.
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
                                            Best choice for SVG conversion when you need to preserve transparency and sharp edges.
                                            Ideal for logos, icons, and graphics with text.
                                        </p>
                                    </div>
                                </div>
                            </div>

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
                                            Suitable when file size is a priority and transparency isn't needed.
                                            Good for SVG illustrations with solid backgrounds or photographic elements.
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
                            Pro Tips for Converting SVG Files
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3">
                                <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Choose <span className="font-semibold text-gray-900 dark:text-white">PNG</span> for graphics with transparency or text
                                </p>
                            </li>
                            <li className="flex items-start space-x-3">
                                <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Use <span className="font-semibold text-gray-900 dark:text-white">JPG</span> when smaller file size is more important than transparency
                                </p>
                            </li>
                            <li className="flex items-start space-x-3">
                                <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Consider the final image dimensions before converting, as SVGs can be scaled to any size
                                </p>
                            </li>
                            <li className="flex items-start space-x-3">
                                <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Use <span className="font-semibold text-gray-900 dark:text-white">Custom Size</span> or <span className="font-semibold text-gray-900 dark:text-white">Scale Factor</span> to adjust the output dimensions while maintaining quality
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SvgToRaster; 