import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { saveAs } from 'file-saver';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const CircleCropper = () => {
    const [image, setImage] = useState(null);
    const [error, setError] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [originalFilename, setOriginalFilename] = useState(null);
    const circleSize = 400; // This should match exactly with the CSS size
    const displaySize = circleSize; // For the visible container
    const transformComponentRef = useRef(null);
    const imageRef = useRef(null);

    const onDrop = useCallback(acceptedFiles => {
        setError(null);
        const file = acceptedFiles[0];

        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        setOriginalFilename(file.name.replace(/\.[^/.]+$/, ""));

        const reader = new FileReader();
        reader.onload = (e) => {
            if (typeof e.target?.result === 'string') {
                setImage(e.target.result);
            }
        };
        reader.onerror = () => {
            setError('Failed to read file');
        };
        reader.readAsDataURL(file);
    }, []);

    const handleDownload = useCallback(async () => {
        if (!image || isDownloading || !transformComponentRef.current) return;

        try {
            setIsDownloading(true);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = circleSize;
            canvas.height = circleSize;

            // Clear the canvas with a transparent background
            ctx.clearRect(0, 0, circleSize, circleSize);

            // Create clipping circle
            ctx.beginPath();
            ctx.arc(circleSize / 2, circleSize / 2, circleSize / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();

            const { instance } = transformComponentRef.current;
            const { scale, positionX, positionY } = instance.transformState;

            const drawImage = new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => {
                    try {
                        // Calculate the dimensions and position to match what's shown in the UI
                        const imgAspectRatio = img.naturalWidth / img.naturalHeight;
                        let drawWidth, drawHeight;

                        if (imgAspectRatio > 1) {
                            // Landscape image
                            drawHeight = circleSize;
                            drawWidth = drawHeight * imgAspectRatio;
                        } else {
                            // Portrait or square image
                            drawWidth = circleSize;
                            drawHeight = drawWidth / imgAspectRatio;
                        }

                        // Apply the scale
                        drawWidth *= scale;
                        drawHeight *= scale;

                        // Center the image and apply transformation
                        const x = (circleSize - drawWidth) / 2 + positionX;
                        const y = (circleSize - drawHeight) / 2 + positionY;

                        ctx.drawImage(
                            img,
                            x,
                            y,
                            drawWidth,
                            drawHeight
                        );

                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                };
                img.onerror = reject;
                img.src = image;
            });

            await drawImage;

            // Convert to blob and save
            canvas.toBlob((blob) => {
                if (blob) {
                    saveAs(blob, `${originalFilename || 'circle'}_cropped.png`);
                } else {
                    throw new Error('Failed to create blob');
                }
            }, 'image/png', 1.0);

        } catch (error) {
            console.error('Download error:', error);
            setError(`Failed to download image`);
        } finally {
            setIsDownloading(false);
        }
    }, [image, isDownloading, originalFilename]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
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
                            Circle Cropper
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Transform your images into perfect circles with our intuitive cropping tool
                        </p>
                    </div>

                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
                        {!image ? (
                            // Dropzone
                            <div {...getRootProps()} className="relative rounded-2xl p-12 text-center transition-all
                                group hover:bg-blue-50/50 dark:hover:bg-blue-900/20
                                before:absolute before:inset-0 before:rounded-2xl before:border-2 before:border-dashed
                                before:pointer-events-none
                                ${isDragActive ? 'before:border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 
                                'before:border-gray-300 dark:before:border-gray-600'}">
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
                            <div className="flex flex-col items-center gap-8">
                                {/* Controls */}
                                <div className="flex gap-4">
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
                                    <button
                                        onClick={handleDownload}
                                        className={`px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 
                                            hover:from-green-600 hover:to-emerald-700
                                            text-white rounded-xl transition-all duration-300 
                                            flex items-center gap-2 hover:scale-105
                                            ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={isDownloading}
                                    >
                                        {isDownloading ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Download Circle
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Circle Crop Area */}
                                <div className="relative rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 p-[1px]"
                                    style={{
                                        width: displaySize,
                                        height: displaySize,
                                        minWidth: displaySize,
                                        minHeight: displaySize
                                    }}>
                                    <div className="absolute inset-0 rounded-full overflow-hidden">
                                        <TransformWrapper
                                            ref={transformComponentRef}
                                            initialScale={1}
                                            minScale={0.1}
                                            maxScale={8}
                                            centerOnInit={true}
                                            limitToBounds={false}
                                            doubleClick={{ disabled: true }}
                                            panning={{ lockAxisY: false, lockAxisX: false }}
                                            wheel={{ wheelDisabled: false }}
                                            pinch={{ pinchDisabled: false }}
                                        >
                                            {({ zoomIn, zoomOut, resetTransform }) => (
                                                <>
                                                    {/* Centered controls */}
                                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                                                        <button
                                                            onClick={() => zoomOut()}
                                                            className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:scale-110 transition-transform"
                                                            aria-label="Zoom out"
                                                        >
                                                            <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => resetTransform()}
                                                            className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:scale-110 transition-transform"
                                                            aria-label="Reset"
                                                        >
                                                            <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => zoomIn()}
                                                            className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:scale-110 transition-transform"
                                                            aria-label="Zoom in"
                                                        >
                                                            <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <TransformComponent
                                                        wrapperStyle={{
                                                            width: "100%",
                                                            height: "100%",
                                                            overflow: "hidden"
                                                        }}
                                                        contentStyle={{
                                                            width: "100%",
                                                            height: "100%",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center"
                                                        }}
                                                    >
                                                        <img
                                                            ref={imageRef}
                                                            src={image}
                                                            alt="Upload"
                                                            style={{
                                                                maxWidth: "none",
                                                                touchAction: "none",
                                                                pointerEvents: "auto",
                                                                width: "auto",
                                                                height: "100%",
                                                                objectFit: "contain"
                                                            }}
                                                            onLoad={(e) => {
                                                                if (transformComponentRef.current) {
                                                                    const img = e.target;
                                                                    const scale = circleSize / img.height;
                                                                    transformComponentRef.current.setTransform(0, 0, scale);
                                                                }
                                                                e.target.style.opacity = "1";
                                                            }}
                                                        />
                                                    </TransformComponent>
                                                </>
                                            )}
                                        </TransformWrapper>
                                    </div>
                                </div>

                                {/* Instructions */}
                                <div className="text-center text-gray-600 dark:text-gray-400">
                                    <p>Drag to position • Pinch or scroll to zoom</p>
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

            <div className="container mx-auto px-4 py-24">
                <div className="max-w-4xl mx-auto space-y-16">
                    {/* Understanding Circle Cropping */}
                    <div className="space-y-8">
                        <div className="text-center">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Understanding Circle Cropping
                            </h2>
                            <div className="w-20 h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    What is Circle Cropping?
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Circle cropping transforms rectangular images into perfect circles, ideal for profile pictures,
                                    logos, and decorative elements. The process maintains the image's central focus while creating
                                    a clean, circular boundary.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Perfect for Social Media
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Most social media platforms use circular profile pictures. Our tool helps you prepare your
                                    images with the perfect circular crop, ensuring they look professional across all platforms.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Features Comparison */}
                    <div className="space-y-8">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                            Key Features
                        </h3>

                        <div className="grid gap-6">
                            {/* Interactive Control Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            Interactive Controls
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                            Easily adjust your image with intuitive zoom, pan, and positioning controls. Get the perfect
                                            crop every time with real-time preview.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Transparent Background Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            Transparent Background
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                            Downloads include a transparent background, making your circular images perfect for
                                            overlaying on any colored background or design.
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
                            Pro Tips for Circle Cropping
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3">
                                <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Center the main subject for the most balanced circular composition
                                </p>
                            </li>
                            <li className="flex items-start space-x-3">
                                <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Use the zoom feature to ensure important details aren't cut off by the circle
                                </p>
                            </li>
                            <li className="flex items-start space-x-3">
                                <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Consider the platform's minimum size requirements when cropping profile pictures
                                </p>
                            </li>
                            <li className="flex items-start space-x-3">
                                <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Start with high-resolution images for the best quality circular crops
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CircleCropper;
