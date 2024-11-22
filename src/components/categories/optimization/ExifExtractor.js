import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { saveAs } from 'file-saver';
import imageCompression from 'browser-image-compression';
import exifr from 'exifr';
import heic2any from 'heic2any';

const ExifExtractor = () => {
    const [image, setImage] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const [setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [exifData, setExifData] = useState(null);
    const [processingOptions, setProcessingOptions] = useState({
        removeExif: false,
        saveAsWebP: false
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [originalFormat, setOriginalFormat] = useState(null);

    // EXIF extraction function
    const extractExifData = useCallback(async (file) => {
        try {
            // Parse all EXIF data
            const data = await exifr.parse(file, true);
            console.log('Raw EXIF data:', data); // For debugging

            if (!data) {
                console.log('No EXIF data found');
                setExifData(null);
                return;
            }

            const formattedData = {
                camera: {
                    make: data.Make,
                    model: data.Model,
                    software: data.Software,
                },
                image: {
                    width: data.ImageWidth || data.ExifImageWidth,
                    height: data.ImageHeight || data.ExifImageHeight,
                    orientation: data.Orientation,
                },
                settings: {
                    focalLength: data.FocalLength ? `${data.FocalLength}mm` : null,
                    aperture: data.FNumber ? `f/${data.FNumber}` : null,
                    iso: data.ISO,
                    exposureTime: data.ExposureTime ? `${data.ExposureTime}s` : null,
                    exposureProgram: data.ExposureProgram,
                    exposureMode: data.ExposureMode,
                    whiteBalance: data.WhiteBalance,
                },
                location: data.latitude && data.longitude ? {
                    latitude: data.latitude,
                    longitude: data.longitude,
                    altitude: data.altitude,
                } : null,
                timestamp: data.CreateDate || data.DateTimeOriginal || data.ModifyDate,
                copyright: data.Copyright,
                artist: data.Artist,
                description: data.ImageDescription,
                software: data.Software,
                rating: data.Rating,
                lens: data.LensModel || data.Lens,
            };

            console.log('Formatted EXIF data:', formattedData); // For debugging
            setExifData(formattedData);
        } catch (err) {
            console.error('Failed to extract EXIF data:', err);
            setError('Failed to extract EXIF data');
            setExifData(null);
        }
    }, [setError]);

    // Helper function to convert HEIC/HEIF to JPEG
    const convertHeicToJpeg = async (file) => {
        try {
            const convertedBlob = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.9
            });
            return new File([convertedBlob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
                type: 'image/jpeg'
            });
        } catch (err) {
            console.error('HEIC conversion failed:', err);
            throw new Error('Failed to convert HEIC image');
        }
    };

    // Modified onDrop function with enhanced format support
    const onDrop = useCallback(async (acceptedFiles) => {
        setError(null);
        setIsProcessing(true);

        try {
            let file = acceptedFiles[0];
            const fileType = file.type.toLowerCase();
            const fileExt = file.name.split('.').pop().toLowerCase();
            setOriginalFormat(fileExt);

            // Handle HEIC/HEIF formats
            if (fileExt === 'heic' || fileExt === 'heif' || fileType.includes('heic') || fileType.includes('heif')) {
                file = await convertHeicToJpeg(file);
            }

            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            setImage(file);
            setProcessedImage(null);

            // Extract EXIF data
            await extractExifData(file);
        } catch (err) {
            setError(err.message || 'Failed to process image');
            console.error('File processing error:', err);
        } finally {
            setIsProcessing(false);
        }
    }, [extractExifData, setError]);

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const processImage = useCallback(async () => {
        if (!image || isProcessing) return;

        try {
            setIsProcessing(true);
            setError(null);

            if (processingOptions.removeExif || processingOptions.saveAsWebP) {
                const options = {
                    maxSizeMB: 100, // High value to maintain original quality
                    useWebWorker: true,
                    preserveExif: !processingOptions.removeExif
                };

                if (processingOptions.saveAsWebP) {
                    options.fileType = 'image/webp';
                }

                const processedFile = await imageCompression(image, options);
                setProcessedImage(processedFile);
            }
        } catch (err) {
            setError('Failed to process image');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    }, [image, processingOptions, isProcessing, setError]);

    const handleDownload = useCallback(() => {
        if (!processedImage && !image) return;

        const fileToDownload = processedImage || image;
        const filename = image.name.replace(/\.[^/.]+$/, "");
        const extension = processingOptions.saveAsWebP ? 'webp' : fileToDownload.type.split('/')[1];
        saveAs(fileToDownload, `${filename}_processed.${extension}`);
    }, [processedImage, image, processingOptions.saveAsWebP, setError]);

    // Update dropzone configuration
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpg', '.jpeg', '.png', '.tiff', '.tif', '.heic', '.heif', '.webp'],
            'image/heic': ['.heic'],
            'image/heif': ['.heif'],
            'image/tiff': ['.tiff', '.tif']
        },
        multiple: false
    });

    // Add format badge component
    const FormatBadge = ({ format }) => {
        const getFormatColor = (fmt) => {
            const colors = {
                heic: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
                heif: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
                tiff: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
                tif: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
                webp: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
                default: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
            };
            return colors[fmt.toLowerCase()] || colors.default;
        };

        return (
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${getFormatColor(format)}`}>
                {format.toUpperCase()}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-16 relative">
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
                {/* Title Section */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 mb-6 drop-shadow-sm">
                        EXIF Data Extractor
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Extract and manage metadata from your images with ease
                    </p>
                </div>

                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Main Card */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">
                        {/* Dropzone */}
                        <div {...getRootProps()} className="cursor-pointer">
                            <input {...getInputProps()} />
                            <div className={`
                                p-12 border-3 border-dashed rounded-2xl text-center
                                transition-all duration-200 ease-in-out
                                ${isDragActive
                                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-102'
                                    : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
                                }
                            `}>
                                <div className="flex flex-col items-center gap-4">
                                    {isProcessing ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 
                                                flex items-center justify-center">
                                                <svg className="w-8 h-8 text-blue-500 animate-spin" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10"
                                                        stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                            </div>
                                            <p className="text-blue-600 dark:text-blue-400">Processing image...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 
                                                flex items-center justify-center">
                                                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                                    {isDragActive ? "Drop your image here" : "Drop your image here, or click to select"}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    Supports JPG, PNG, WebP, TIFF, HEIC, and HEIF
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2 justify-center mt-2">
                                                <FormatBadge format="HEIC" />
                                                <FormatBadge format="TIFF" />
                                                <FormatBadge format="WebP" />
                                                <FormatBadge format="JPG" />
                                                <FormatBadge format="PNG" />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Image Preview and EXIF Data Section */}
                        {imagePreview && (
                            <div className="space-y-8">
                                {/* Image Preview Card */}
                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-6">
                                    <div className="flex flex-col md:flex-row gap-8">
                                        {/* Image Preview */}
                                        <div className="flex-1 min-w-0">
                                            <div className="relative group">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-auto rounded-xl shadow-lg"
                                                />
                                            </div>

                                            {/* Image Info */}
                                            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                                                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                                                    <p className="text-gray-500 dark:text-gray-400">File Name</p>
                                                    <p className="font-medium text-gray-900 dark:text-white truncate">
                                                        {image.name}
                                                    </p>
                                                </div>
                                                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                                                    <p className="text-gray-500 dark:text-gray-400">File Size</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {(image.size / (1024 * 1024)).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                                                    <p className="text-gray-500 dark:text-gray-400">Format</p>
                                                    <div className="mt-1">
                                                        <FormatBadge format={originalFormat} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="flex flex-col gap-4 md:w-64">
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                                Quick Actions
                                            </h3>

                                            {/* Processing Options */}
                                            <div className="space-y-4">
                                                <label className="flex items-center justify-between p-3 bg-white/50 
                                                    dark:bg-gray-800/50 rounded-xl cursor-pointer group transition-colors
                                                    hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                                    <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 
                                                        dark:group-hover:text-blue-400 transition-colors">
                                                        Remove EXIF
                                                    </span>
                                                    <input
                                                        type="checkbox"
                                                        checked={processingOptions.removeExif}
                                                        onChange={(e) => setProcessingOptions(prev => ({
                                                            ...prev,
                                                            removeExif: e.target.checked
                                                        }))}
                                                        className="w-4 h-4 text-blue-600 rounded border-gray-300
                                                            focus:ring-blue-500 dark:focus:ring-blue-600"
                                                    />
                                                </label>

                                                <label className="flex items-center justify-between p-3 bg-white/50 
                                                    dark:bg-gray-800/50 rounded-xl cursor-pointer group transition-colors
                                                    hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                                    <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 
                                                        dark:group-hover:text-blue-400 transition-colors">
                                                        Convert to WebP
                                                    </span>
                                                    <input
                                                        type="checkbox"
                                                        checked={processingOptions.saveAsWebP}
                                                        onChange={(e) => setProcessingOptions(prev => ({
                                                            ...prev,
                                                            saveAsWebP: e.target.checked
                                                        }))}
                                                        className="w-4 h-4 text-blue-600 rounded border-gray-300
                                                            focus:ring-blue-500 dark:focus:ring-blue-600"
                                                    />
                                                </label>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="space-y-3 mt-auto">
                                                {(processingOptions.removeExif || processingOptions.saveAsWebP) && (
                                                    <button
                                                        onClick={processImage}
                                                        disabled={isProcessing}
                                                        className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 
                                                            hover:from-blue-600 hover:to-blue-700 text-white rounded-xl 
                                                            font-medium shadow-lg shadow-blue-500/25 disabled:opacity-50 
                                                            disabled:cursor-not-allowed transition-all duration-200"
                                                    >
                                                        {isProcessing ? (
                                                            <span className="flex items-center justify-center gap-2">
                                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10"
                                                                        stroke="currentColor" strokeWidth="4" fill="none" />
                                                                    <path className="opacity-75" fill="currentColor"
                                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                                </svg>
                                                                Processing...
                                                            </span>
                                                        ) : 'Process Image'}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={handleDownload}
                                                    className="w-full px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 
                                                        hover:from-green-600 hover:to-green-700 text-white rounded-xl 
                                                        font-medium shadow-lg shadow-green-500/25 transition-all duration-200"
                                                >
                                                    Download Image
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* EXIF Data Display */}
                                {exifData ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Image Metadata
                                            </h2>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                EXIF data found
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {/* Camera Info */}
                                            {(exifData.camera.make || exifData.camera.model || exifData.lens) && (
                                                <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-sm">
                                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Camera Details</h3>
                                                    <div className="space-y-2">
                                                        {exifData.camera.make && (
                                                            <p className="text-gray-600 dark:text-gray-400">
                                                                <span className="font-medium">Make:</span> {exifData.camera.make}
                                                            </p>
                                                        )}
                                                        {exifData.camera.model && (
                                                            <p className="text-gray-600 dark:text-gray-400">
                                                                <span className="font-medium">Model:</span> {exifData.camera.model}
                                                            </p>
                                                        )}
                                                        {exifData.lens && (
                                                            <p className="text-gray-600 dark:text-gray-400">
                                                                <span className="font-medium">Lens:</span> {exifData.lens}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Camera Settings */}
                                            {Object.values(exifData.settings).some(Boolean) && (
                                                <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-sm">
                                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Camera Settings</h3>
                                                    <div className="space-y-2">
                                                        {exifData.settings.focalLength && (
                                                            <p className="text-gray-600 dark:text-gray-400">
                                                                <span className="font-medium">Focal Length:</span> {exifData.settings.focalLength}
                                                            </p>
                                                        )}
                                                        {exifData.settings.aperture && (
                                                            <p className="text-gray-600 dark:text-gray-400">
                                                                <span className="font-medium">Aperture:</span> {exifData.settings.aperture}
                                                            </p>
                                                        )}
                                                        {exifData.settings.iso && (
                                                            <p className="text-gray-600 dark:text-gray-400">
                                                                <span className="font-medium">ISO:</span> {exifData.settings.iso}
                                                            </p>
                                                        )}
                                                        {exifData.settings.exposureTime && (
                                                            <p className="text-gray-600 dark:text-gray-400">
                                                                <span className="font-medium">Exposure Time:</span> {exifData.settings.exposureTime}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Location Data */}
                                            {exifData.location && (
                                                <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-sm">
                                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Location Data</h3>
                                                    <div className="space-y-2">
                                                        <p className="text-gray-600 dark:text-gray-400">
                                                            <span className="font-medium">Latitude:</span> {exifData.location.latitude.toFixed(6)}°
                                                        </p>
                                                        <p className="text-gray-600 dark:text-gray-400">
                                                            <span className="font-medium">Longitude:</span> {exifData.location.longitude.toFixed(6)}°
                                                        </p>
                                                        {exifData.location.altitude && (
                                                            <p className="text-gray-600 dark:text-gray-400">
                                                                <span className="font-medium">Altitude:</span> {exifData.location.altitude.toFixed(1)}m
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Additional Info */}
                                            {(exifData.timestamp || exifData.copyright || exifData.artist || exifData.description) && (
                                                <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-sm">
                                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Additional Info</h3>
                                                    <div className="space-y-2">
                                                        {exifData.timestamp && (
                                                            <p className="text-gray-600 dark:text-gray-400">
                                                                <span className="font-medium">Date Taken:</span>{' '}
                                                                {new Date(exifData.timestamp).toLocaleString()}
                                                            </p>
                                                        )}
                                                        {exifData.copyright && (
                                                            <p className="text-gray-600 dark:text-gray-400">
                                                                <span className="font-medium">Copyright:</span> {exifData.copyright}
                                                            </p>
                                                        )}
                                                        {exifData.artist && (
                                                            <p className="text-gray-600 dark:text-gray-400">
                                                                <span className="font-medium">Artist:</span> {exifData.artist}
                                                            </p>
                                                        )}
                                                        {exifData.description && (
                                                            <p className="text-gray-600 dark:text-gray-400">
                                                                <span className="font-medium">Description:</span> {exifData.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-2xl p-6 text-yellow-800 
                                        dark:text-yellow-200 flex items-center gap-3">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <span>No EXIF data found in this image</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Add this after the main EXIF extractor section */}
                    <div className="container mx-auto px-4 py-24">
                        <div className="max-w-4xl mx-auto space-y-16">
                            {/* Understanding EXIF Section */}
                            <div className="space-y-8">
                                <div className="text-center">
                                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                        Understanding EXIF Data
                                    </h2>
                                    <div className="w-20 h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full" />
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            What is EXIF Data?
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                            EXIF (Exchangeable Image File Format) is metadata embedded in image files by digital cameras and smartphones.
                                            It contains detailed information about how, when, and where a photo was taken, including camera settings,
                                            GPS coordinates, and more.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            Why Remove EXIF Data?
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                            While EXIF data is useful for photographers, it can contain sensitive information like location data.
                                            Removing EXIF data helps protect privacy when sharing photos online and reduces file size.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* EXIF Data Types Section */}
                            <div className="space-y-8">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                                    Common EXIF Data Types
                                </h3>

                                <div className="grid gap-6">
                                    {/* Camera Info Card */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                        <div className="flex items-start space-x-4">
                                            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                    Camera Information
                                                </h4>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                                    Includes camera make, model, lens details, and software used. Useful for photographers
                                                    tracking their equipment usage and workflow.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Technical Settings Card */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                        <div className="flex items-start space-x-4">
                                            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                    Technical Settings
                                                </h4>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                                    Contains aperture, shutter speed, ISO, and focal length information. Essential for understanding
                                                    and replicating specific photography techniques.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location Data Card */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                        <div className="flex items-start space-x-4">
                                            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                    Location Data
                                                </h4>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                                    GPS coordinates and altitude information. Useful for photo organization but may raise privacy
                                                    concerns when sharing images online.
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
                                    Pro Tips for Managing EXIF Data
                                </h3>
                                <ul className="space-y-4">
                                    <li className="flex items-start space-x-3">
                                        <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Always <span className="font-semibold text-gray-900 dark:text-white">backup original files</span> before
                                            removing EXIF data to preserve important photo information
                                        </p>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Consider <span className="font-semibold text-gray-900 dark:text-white">removing location data</span> when
                                            sharing photos on social media for privacy
                                        </p>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Use EXIF data to <span className="font-semibold text-gray-900 dark:text-white">learn from your photos</span> by
                                            analyzing successful shots' camera settings
                                        </p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExifExtractor;