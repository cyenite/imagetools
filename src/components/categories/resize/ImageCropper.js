import React, { useState, useRef, useCallback } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ImageCropper = ({ image, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState(null);
    const imgRef = useRef(null);
    const [completedCrop, setCompletedCrop] = useState(null);

    const onImageLoad = useCallback((e) => {
        const { width, height } = e.currentTarget;
        const size = Math.min(width, height);
        const x = (width - size) / 2;
        const y = (height - size) / 2;

        setCrop({
            unit: 'px',
            width: size,
            height: size,
            x,
            y,
            aspect: 1
        });
    }, []);

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
            <div className="flex-1 min-h-0 flex items-center justify-center p-4">
                <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={1}
                    circularCrop={false}
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