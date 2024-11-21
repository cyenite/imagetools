import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import jsPDF from 'jspdf';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Set the worker source to local file
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const ImageToPdf = () => {
    const [convertingFiles, setConvertingFiles] = useState([]);
    const [error, setError] = useState(null);
    const [cancelTokens, setCancelTokens] = useState({});
    const [pdfPreviews, setPdfPreviews] = useState({});
    const [currentPages, setCurrentPages] = useState({});
    const [totalPages, setTotalPages] = useState({});

    const onDrop = useCallback(async (acceptedFiles) => {
        setError(null);
        setCancelTokens({});

        const imageFiles = acceptedFiles.filter(file =>
            file.type.startsWith('image/')
        );

        if (imageFiles.length === 0) {
            setError('Please select image files only (JPG, PNG, WebP, etc.)');
            return;
        }

        setConvertingFiles(imageFiles.map(file => ({
            name: file.name,
            status: 'converting',
            progress: 0,
            preview: URL.createObjectURL(file)
        })));

        imageFiles.forEach(async (file, index) => {
            try {
                const progressInterval = setInterval(() => {
                    if (cancelTokens[index]) {
                        clearInterval(progressInterval);
                        setConvertingFiles(prev => prev.map((f, i) =>
                            i === index ? { ...f, status: 'cancelled', progress: 0 } : f
                        ));
                        return;
                    }

                    setConvertingFiles(prev => prev.map((f, i) =>
                        i === index && f.status === 'converting'
                            ? { ...f, progress: Math.min(f.progress + 10, 90) }
                            : f
                    ));
                }, 100);

                const img = new Image();
                img.src = URL.createObjectURL(file);

                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });

                if (cancelTokens[index]) {
                    URL.revokeObjectURL(img.src);
                    return;
                }

                const pdf = new jsPDF({
                    orientation: img.width > img.height ? 'landscape' : 'portrait',
                    unit: 'px',
                    format: [img.width, img.height]
                });

                pdf.addImage(
                    img,
                    'JPEG',
                    0,
                    0,
                    img.width,
                    img.height
                );

                const pdfBlob = pdf.output('blob');
                const pdfUrl = URL.createObjectURL(pdfBlob);

                const loadingTask = getDocument(pdfUrl);
                const pdfDoc = await loadingTask.promise;

                const page = await pdfDoc.getPage(1);
                const viewport = page.getViewport({ scale: 1 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                setPdfPreviews(prev => ({
                    ...prev,
                    [index]: canvas.toDataURL()
                }));
                setCurrentPages(prev => ({
                    ...prev,
                    [index]: 1
                }));
                setTotalPages(prev => ({
                    ...prev,
                    [index]: pdfDoc.numPages
                }));

                pdf.save(`${file.name.split('.')[0]}_imagetools-xyz.pdf`);

                clearInterval(progressInterval);
                URL.revokeObjectURL(img.src);
                URL.revokeObjectURL(pdfUrl);

                setConvertingFiles(prev => prev.map((f, i) =>
                    i === index ? {
                        ...f,
                        status: 'completed',
                        progress: 100,
                        pdfUrl
                    } : f
                ));

            } catch (err) {
                setError(`Error converting ${file.name}: ${err.message}`);
                setConvertingFiles(prev => prev.map((f, i) =>
                    i === index ? { ...f, status: 'error', progress: 0 } : f
                ));
            }
        });
    }, [cancelTokens]);

    useEffect(() => {
        return () => {
            convertingFiles.forEach(file => {
                if (file.preview) {
                    URL.revokeObjectURL(file.preview);
                }
                if (file.pdfUrl) {
                    URL.revokeObjectURL(file.pdfUrl);
                }
            });
        };
    }, [convertingFiles]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif']
        }
    });

    const cancelConversion = (index) => {
        setCancelTokens(prev => ({
            ...prev,
            [index]: true
        }));
    };

    const navigatePage = async (index, direction) => {
        const newPage = currentPages[index] + direction;
        if (newPage < 1 || newPage > totalPages[index]) return;

        const file = convertingFiles[index];
        if (!file.pdfUrl) return;

        try {
            const loadingTask = getDocument(file.pdfUrl);
            const pdfDoc = await loadingTask.promise;
            const page = await pdfDoc.getPage(newPage);
            const viewport = page.getViewport({ scale: 1 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            setPdfPreviews(prev => ({
                ...prev,
                [index]: canvas.toDataURL()
            }));
            setCurrentPages(prev => ({
                ...prev,
                [index]: newPage
            }));
        } catch (err) {
            console.error('Error navigating PDF pages:', err);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 pt-16 relative">
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
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                            Image to PDF Converter
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400">
                            Convert images to PDF files instantly
                        </p>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                        <div className="space-y-6">
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
                                                {isDragActive ? 'Drop your files here' : 'Drag and drop your image files here'}
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

                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                                    {error}
                                </div>
                            )}

                            {convertingFiles.length > 0 && (
                                <div className="space-y-3">
                                    {convertingFiles.map((file, index) => (
                                        <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                    {file.name}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    {file.status === 'converting' && (
                                                        <button
                                                            onClick={() => cancelConversion(index)}
                                                            className="text-red-500 hover:text-red-600 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                    <span className={`px-4 py-1.5 rounded-full text-sm font-medium 
                                                        ${file.status === 'completed'
                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                            : file.status === 'error'
                                                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                                : file.status === 'cancelled'
                                                                    ? 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
                                                                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                                        }`}
                                                    >
                                                        {file.status === 'completed'
                                                            ? 'Completed'
                                                            : file.status === 'error'
                                                                ? 'Error'
                                                                : file.status === 'cancelled'
                                                                    ? 'Cancelled'
                                                                    : `Converting ${file.progress}%`}
                                                    </span>
                                                </div>
                                            </div>

                                            {file.status !== 'error' && file.status !== 'cancelled' && (
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

                                            {file.status === 'completed' && pdfPreviews[index] && (
                                                <div className="mt-4">
                                                    <div className="relative">
                                                        <img
                                                            src={pdfPreviews[index]}
                                                            alt={`Preview of ${file.name}`}
                                                            className="max-h-48 rounded-lg mx-auto"
                                                        />
                                                        {totalPages[index] > 1 && (
                                                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 
                                                                        flex items-center gap-2 bg-black/50 text-white rounded-full px-3 py-1">
                                                                <button
                                                                    onClick={() => navigatePage(index, -1)}
                                                                    disabled={currentPages[index] === 1}
                                                                    className="disabled:opacity-50"
                                                                >
                                                                    ←
                                                                </button>
                                                                <span className="text-sm">
                                                                    {currentPages[index]} / {totalPages[index]}
                                                                </span>
                                                                <button
                                                                    onClick={() => navigatePage(index, 1)}
                                                                    disabled={currentPages[index] === totalPages[index]}
                                                                    className="disabled:opacity-50"
                                                                >
                                                                    →
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
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

            <div className="container mx-auto px-4 py-24">
                <div className="max-w-4xl mx-auto space-y-16">
                    <div className="space-y-8">
                        <div className="text-center">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Understanding Image to PDF Conversion
                            </h2>
                            <div className="w-20 h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    What is Image to PDF Conversion?
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Image to PDF conversion transforms image files into PDF documents.
                                    This process preserves the quality of your images while making them
                                    easier to share and integrate into document workflows.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Why Convert Images to PDFs?
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Converting images to PDFs makes them easier to share on social media, embed in presentations,
                                    or use in situations where PDF viewing isn't practical. It also allows for quick previews of document content.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                            Choosing the Right Format
                        </h3>

                        <div className="grid gap-6">
                            {/* Similar format cards as HeicConverter, but with PDF-specific content */}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 
                        rounded-2xl p-8 border border-blue-100 dark:border-blue-800">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            Pro Tips for Image to PDF Conversion
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3">
                                <svg className="w-6 h-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Choose <span className="font-semibold text-gray-900 dark:text-white">JPG</span> for documents with photos and complex graphics
                                </p>
                            </li>
                            {/* Add more tips */}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageToPdf; 