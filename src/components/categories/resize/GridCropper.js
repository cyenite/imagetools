import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import ImageCropper from './ImageCropper';

const GridCropper = () => {
    const [image, setImage] = useState(null);
    const [gridSize, setGridSize] = useState({ rows: 2, cols: 2 });
    const [error, setError] = useState(null);
    const [isSquareGrid, setIsSquareGrid] = useState(false);
    const canvasRef = useRef(null);
    const previewCanvasRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [originalFilename, setOriginalFilename] = useState(null);
    const [hasDownloaded, setHasDownloaded] = useState(false);
    const [showAspectWarning, setShowAspectWarning] = useState(false);
    const [showCropDialog, setShowCropDialog] = useState(false);
    const [cropAspectRatio, setCropAspectRatio] = useState(1);

    const drawImage = useCallback((img) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Set maximum dimensions for the preview
        const maxWidth = 800;
        const maxHeight = 600;

        // Calculate scaling ratio to maintain aspect ratio
        let width = img.width;
        let height = img.height;
        let ratio = 1;

        if (width > maxWidth || height > maxHeight) {
            ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Clear canvas and draw image
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
    }, []);

    const drawGridPreview = useCallback((img) => {
        const canvas = previewCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Use same dimensions as original preview
        const maxWidth = 800;
        const maxHeight = 600;

        let width = img.width;
        let height = img.height;
        let ratio = 1;

        if (width > maxWidth || height > maxHeight) {
            ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Clear canvas and draw image
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Draw grid lines
        const { rows, cols } = gridSize;
        const cellWidth = width / cols;
        const cellHeight = height / rows;

        // Draw semi-transparent overlay and grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;

        // Draw vertical and horizontal lines
        for (let i = 1; i < cols; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellWidth, 0);
            ctx.lineTo(i * cellWidth, height);
            ctx.stroke();
        }

        for (let i = 1; i < rows; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * cellHeight);
            ctx.lineTo(width, i * cellHeight);
            ctx.stroke();
        }

        // Only draw numbers if grid has been downloaded
        if (hasDownloaded) {
            let count = rows * cols;
            ctx.font = `bold ${Math.min(cellWidth, cellHeight) / 4}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            for (let row = rows - 1; row >= 0; row--) {
                for (let col = cols - 1; col >= 0; col--) {
                    // Draw cell overlay
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                    ctx.fillRect(
                        col * cellWidth,
                        row * cellHeight,
                        cellWidth,
                        cellHeight
                    );

                    // Draw cell borders
                    ctx.strokeRect(
                        col * cellWidth,
                        row * cellHeight,
                        cellWidth,
                        cellHeight
                    );

                    // Draw number
                    const x = col * cellWidth + cellWidth / 2;
                    const y = row * cellHeight + cellHeight / 2;

                    // Draw white outline
                    ctx.strokeStyle = 'white';
                    ctx.lineWidth = 4;
                    ctx.strokeText(count.toString(), x, y);

                    // Draw white number
                    ctx.fillStyle = 'white';
                    ctx.fillText(count.toString(), x, y);

                    count--;
                }
            }
        }
    }, [gridSize, hasDownloaded]);

    const onDrop = useCallback(acceptedFiles => {
        setError(null);
        setHasDownloaded(false);
        const file = acceptedFiles[0];

        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        setOriginalFilename(file.name.replace(/\.[^/.]+$/, ""));

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                setImage(img);
                drawImage(img);
                drawGridPreview(img);
            };
            img.onerror = () => {
                setError('Failed to load image');
            };
            img.src = e.target.result;
        };
        reader.onerror = () => {
            setError('Failed to read file');
        };
        reader.readAsDataURL(file);
    }, [drawImage, drawGridPreview]);

    const handleGridSizeChange = (type, value) => {
        const newValue = parseInt(value);
        setHasDownloaded(false);
        setGridSize(prev => ({ ...prev, [type]: newValue }));
    };

    const checkImageAspectRatio = useCallback((img) => {
        if (!isSquareGrid) return;

        // For a square grid, the image aspect ratio should match the grid ratio
        const idealRatio = gridSize.cols / gridSize.rows;
        const imageRatio = img.width / img.height;

        // Allow 5% tolerance
        const tolerance = 0.05;
        const isProperRatio = Math.abs(imageRatio - idealRatio) < tolerance;

        // For debugging
        console.log({
            imageWidth: img.width,
            imageHeight: img.height,
            imageRatio,
            idealRatio,
            difference: Math.abs(imageRatio - idealRatio),
            isProperRatio
        });

        setShowAspectWarning(!isProperRatio);
    }, [isSquareGrid, gridSize]);

    useEffect(() => {
        if (image) {
            checkImageAspectRatio(image);
            drawImage(image);
            drawGridPreview(image);
        }
    }, [image, checkImageAspectRatio, drawImage, drawGridPreview]);

    const handleSquareGridToggle = (checked) => {
        setIsSquareGrid(checked);
        if (image) {
            checkImageAspectRatio(image);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
        },
        multiple: false
    });

    const handleDownload = useCallback(async () => {
        if (!image || isDownloading) return;

        try {
            setIsDownloading(true);
            if (!image) return;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Use same dimensions as preview
            const maxWidth = 800;
            const maxHeight = 600;
            let width = image.width;
            let height = image.height;
            let ratio = 1;

            if (width > maxWidth || height > maxHeight) {
                ratio = Math.min(maxWidth / width, maxHeight / height);
                width = width * ratio;
                height = height * ratio;
            }

            // Set full canvas dimensions
            canvas.width = width;
            canvas.height = height;

            // Draw full image
            ctx.drawImage(image, 0, 0, width, height);

            // Calculate grid dimensions
            const cellWidth = width / gridSize.cols;
            const cellHeight = height / gridSize.rows;

            // Create zip file
            const zip = new JSZip();
            const filename = originalFilename || 'image';

            // Create individual grid images
            let count = gridSize.rows * gridSize.cols;
            for (let row = gridSize.rows - 1; row >= 0; row--) {
                for (let col = gridSize.cols - 1; col >= 0; col--) {
                    // Create temporary canvas for each grid cell
                    const cellCanvas = document.createElement('canvas');
                    const cellCtx = cellCanvas.getContext('2d');
                    cellCanvas.width = cellWidth;
                    cellCanvas.height = cellHeight;

                    // Draw portion of original image
                    cellCtx.drawImage(
                        canvas,
                        col * cellWidth,
                        row * cellHeight,
                        cellWidth,
                        cellHeight,
                        0,
                        0,
                        cellWidth,
                        cellHeight
                    );

                    // Convert to blob and add to zip
                    const imageData = cellCanvas.toDataURL('image/png');
                    const imageBlob = await fetch(imageData).then(r => r.blob());
                    zip.file(`${filename}_${count}.png`, imageBlob);
                    count--;
                }
            }

            // Generate and download zip file
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            saveAs(zipBlob, `${filename}_grid.zip`);
            setHasDownloaded(true);
        } catch (error) {
            setError('Failed to download grid images');
        } finally {
            setIsDownloading(false);
        }
    }, [image, gridSize, isDownloading, originalFilename]);

    const handleCropComplete = useCallback((croppedImage) => {
        setImage(croppedImage);
        setShowCropDialog(false);
        setShowAspectWarning(false);

        // Wait for the next frame to ensure the image is loaded
        requestAnimationFrame(() => {
            drawImage(croppedImage);
            drawGridPreview(croppedImage);
            checkImageAspectRatio(croppedImage);
        });
    }, [drawImage, drawGridPreview, checkImageAspectRatio]);

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
                            Grid Cropper
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Transform your images into perfectly balanced grid layouts with our intuitive cropping tool
                        </p>
                    </div>

                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
                        {/* Modern Grid Controls */}
                        <div className="mb-8 space-y-6">
                            {/* Square Grid Toggle */}
                            <div className="flex items-center justify-center gap-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={isSquareGrid}
                                        onChange={(e) => {
                                            handleSquareGridToggle(e.target.checked);
                                        }}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                                        peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer 
                                        dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white 
                                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                                        after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
                                        after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Square Grids
                                    </span>
                                </label>
                            </div>

                            {/* Grid Size Controls */}
                            <div className="flex flex-wrap justify-center items-center gap-6">
                                <div className="flex items-center gap-4">
                                    <label className="text-gray-700 dark:text-gray-300 font-medium">
                                        Rows:
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={gridSize.rows}
                                            onChange={(e) => handleGridSizeChange('rows', e.target.value)}
                                            className="w-24 px-4 py-2.5 bg-white dark:bg-gray-700 
                                                border border-gray-200 dark:border-gray-600 rounded-xl
                                                text-gray-700 dark:text-gray-300 
                                                focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="text-gray-700 dark:text-gray-300 font-medium">
                                        Columns:
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={gridSize.cols}
                                            onChange={(e) => handleGridSizeChange('cols', e.target.value)}
                                            className="w-24 px-4 py-2.5 bg-white dark:bg-gray-700 
                                                border border-gray-200 dark:border-gray-600 rounded-xl
                                                text-gray-700 dark:text-gray-300 
                                                focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {!image ? (
                            // Modern Dropzone
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
                            // Modern Preview Area
                            <div className="mt-8 grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
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
                                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl overflow-hidden w-full h-full">
                                            <canvas
                                                ref={canvasRef}
                                                className="max-w-full h-auto block"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                                            Grid Preview
                                        </h3>
                                        <button
                                            onClick={handleDownload}
                                            className={`px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 
                                                hover:from-green-600 hover:to-emerald-700
                                                text-white rounded-xl transition-all duration-300 
                                                flex items-center gap-2 hover:scale-105
                                                ${(isDownloading || !image) ? 'opacity-50 cursor-not-allowed' : ''}
                                            `}
                                            disabled={isDownloading || !image}
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
                                                    Download Grid
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 p-[1px]">
                                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl overflow-hidden">
                                            <canvas ref={previewCanvasRef} className="max-w-full h-auto" />
                                        </div>
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

                        {/* Warning Message */}
                        {showAspectWarning && (
                            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p className="text-yellow-800 dark:text-yellow-200">
                                        Your image proportions will result in stretched grid cells. Consider cropping for better results.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowCropDialog(true)}
                                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 
                                                text-white rounded-lg transition-colors duration-200 
                                                flex items-center gap-2 text-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" />
                                    </svg>
                                    Crop Image
                                </button>
                            </div>
                        )}

                        {/* Crop Dialog */}
                        {showCropDialog && (
                            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                Crop Image
                                            </h3>
                                            <button
                                                onClick={() => setShowCropDialog(false)}
                                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 
                                                    dark:hover:text-gray-200 transition-colors duration-200"
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-grow overflow-hidden p-4">
                                        <ImageCropper
                                            image={image}
                                            onCropComplete={handleCropComplete}
                                            onCancel={() => setShowCropDialog(false)}
                                            aspectRatio={cropAspectRatio}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add this after the main grid cropper section */}
            <div className="container mx-auto px-4 py-24">
                <div className="max-w-4xl mx-auto space-y-16">
                    {/* Understanding Grid Cropping */}
                    <div className="space-y-8">
                        <div className="text-center">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Understanding Grid Cropping
                            </h2>
                            <div className="w-20 h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    What is Grid Cropping?
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Grid cropping divides an image into equal segments, perfect for creating Instagram grid posts
                                    or mosaic-style displays. Each segment maintains its relative position, allowing you to reconstruct
                                    the original image when posted in sequence.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Square vs. Custom Grids
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    While square grids are ideal for platforms like Instagram, custom grids offer more creative
                                    flexibility. Square grids work best with square images to maintain consistent proportions
                                    across all segments.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Grid Types Comparison */}
                    <div className="space-y-8">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                            Choosing the Right Grid Layout
                        </h3>

                        <div className="grid gap-6">
                            {/* Square Grid Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            Square Grid (1:1)
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                            Perfect for Instagram and social media posts. Creates uniform segments that maintain
                                            consistent spacing and alignment. Best used with square images to avoid distortion.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Custom Grid Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            Custom Grid (Rows × Columns)
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                            Offers more creative freedom for various display purposes. Allows you to maintain the original
                                            image proportions while creating a custom grid layout. Ideal for web galleries and creative displays.
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
                            Pro Tips for Grid Cropping
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3">
                                <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Use the <span className="font-semibold text-gray-900 dark:text-white">square crop tool</span> to
                                    prepare your image for square grids
                                </p>
                            </li>
                            <li className="flex items-start space-x-3">
                                <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-600 dark:text-gray-400">
                                    For Instagram posts, stick to <span className="font-semibold text-gray-900 dark:text-white">3×3 grids</span> for
                                    the most common and visually appealing layout
                                </p>
                            </li>
                            <li className="flex items-start space-x-3">
                                <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-600 dark:text-gray-400">
                                    The <span className="font-semibold text-gray-900 dark:text-white">numbered preview</span> helps you
                                    maintain the correct posting order for your grid
                                </p>
                            </li>
                            <li className="flex items-start space-x-3">
                                <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Consider the <span className="font-semibold text-gray-900 dark:text-white">focal points</span> of your
                                    image when choosing between square and custom grids
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default GridCropper; 