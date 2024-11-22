import React, { useState, useRef, useCallback } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ImageCropper = ({ image, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState(null);
    const [selectedRatio, setSelectedRatio] = useState('3:2');
    const imgRef = useRef(null);
    const [completedCrop, setCompletedCrop] = useState(null);

    // Define available ratios with their snap ranges
    const ratioOptions = [
        {
            label: '1:1',
            value: 1,
            min: 0.9,
            max: 1.1,
            gridSuggestion: 'Perfect for 1×1, 2×2, 3×3, or 4×4 square grids'
        },
        {
            label: '2:1',
            value: 2,
            min: 1.8,
            max: 2.2,
            gridSuggestion: 'Ideal for 2×1 or 4×2 horizontal grid layouts'
        },
        {
            label: '1:2',
            value: 0.5,
            min: 0.45,
            max: 0.55,
            gridSuggestion: 'Perfect for 1×2 or 2×4 vertical grid layouts'
        },
        {
            label: '3:2',
            value: 1.5,
            min: 1.4,
            max: 1.6,
            gridSuggestion: 'Works well with 3×2 horizontal grid layouts'
        },
        {
            label: '2:3',
            value: 0.667,
            min: 0.62,
            max: 0.71,
            gridSuggestion: 'Suitable for 2×3 vertical grid layouts'
        },
        {
            label: '4:3',
            value: 1.333,
            min: 1.28,
            max: 1.38,
            gridSuggestion: 'Good for 4×3 horizontal grid arrangements'
        },
        {
            label: '3:4',
            value: 0.75,
            min: 0.72,
            max: 0.78,
            gridSuggestion: 'Ideal for 3×4 vertical grid arrangements'
        }
    ];

    const handleCropComplete = (crop, percentageCrop) => {
        setCompletedCrop(crop);
    };

    const onImageLoad = useCallback((e) => {
        const { width, height } = e.currentTarget;
        const baseSize = Math.min(width, height);
        const x = (width - baseSize * 1.5) / 2;
        const y = (height - baseSize) / 2;

        setCrop({
            unit: 'px',
            width: baseSize * 1.5,
            height: baseSize,
            x,
            y,
            aspect: 1.5
        });
    }, []);

    const handleCropChange = (newCrop) => {
        if (!newCrop.width || !newCrop.height) return;

        const ratio = newCrop.width / newCrop.height;
        let snappedRatio = ratio;
        let snappedCrop = { ...newCrop };
        let matchedRatio = null;

        // Find the matching ratio option
        for (const option of ratioOptions) {
            if (ratio >= option.min && ratio <= option.max) {
                snappedRatio = option.value;
                matchedRatio = option.label;

                // Adjust dimensions based on the snapped ratio
                if (snappedRatio === 1) {
                    const size = Math.min(newCrop.width, newCrop.height);
                    snappedCrop.width = size;
                    snappedCrop.height = size;
                } else if (snappedRatio > 1) {
                    snappedCrop.height = newCrop.width / snappedRatio;
                } else {
                    snappedCrop.width = newCrop.height * snappedRatio;
                }
                break;
            }
        }

        // Update selected ratio label if we found a match
        if (matchedRatio) {
            setSelectedRatio(matchedRatio);
        }

        setCrop({
            ...snappedCrop,
            aspect: snappedRatio
        });
    };

    const handleRatioSelect = (option) => {
        setSelectedRatio(option.label);
        const currentCrop = crop || {};
        const baseSize = Math.min(currentCrop.width || 100, currentCrop.height || 100);

        let newWidth, newHeight;
        if (option.value === 1) {
            newWidth = baseSize;
            newHeight = baseSize;
        } else if (option.value > 1) {
            newWidth = baseSize * option.value;
            newHeight = baseSize;
        } else {
            newWidth = baseSize;
            newHeight = baseSize / option.value;
        }

        setCrop({
            ...currentCrop,
            width: newWidth,
            height: newHeight,
            aspect: option.value
        });
    };

    const createCroppedImage = useCallback((crop) => {
        if (!imgRef.current || !crop?.width || !crop?.height) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

        canvas.width = crop.width * scaleX;
        canvas.height = crop.height * scaleY;

        ctx.drawImage(
            imgRef.current,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
        );

        const croppedImage = new Image();
        croppedImage.onload = () => {
            onCropComplete(croppedImage);
        };
        croppedImage.src = canvas.toDataURL('image/png');
    }, [onCropComplete]);

    return (
        <div className="flex flex-col h-full">
            {/* Ratio selector buttons with suggestions */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-2 overflow-x-auto">
                    {ratioOptions.map((option) => (
                        <button
                            key={option.label}
                            onClick={() => handleRatioSelect(option)}
                            className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${selectedRatio === option.label
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                {/* Grid suggestion note */}
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    {ratioOptions.find(option => option.label === selectedRatio)?.gridSuggestion ||
                        'Select an aspect ratio to see grid suggestions'}
                </div>
            </div>

            <div className="flex-1 min-h-0 flex items-center justify-center p-4">
                <ReactCrop
                    crop={crop}
                    onChange={handleCropChange}
                    onComplete={handleCropComplete}
                    className="max-h-full w-auto"
                >
                    <img
                        ref={imgRef}
                        src={image.src}
                        alt="Crop preview"
                        style={{
                            maxHeight: 'calc(70vh - 100px)',
                            width: 'auto',
                            objectFit: 'contain'
                        }}
                        onLoad={onImageLoad}
                    />
                </ReactCrop>
            </div>
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                        dark:hover:text-gray-200 transition-colors duration-200"
                >
                    Cancel
                </button>
                <button
                    onClick={() => createCroppedImage(completedCrop)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white 
                        rounded-lg transition-colors duration-200"
                >
                    Apply Crop
                </button>
            </div>
        </div>
    );
};

export default ImageCropper; 