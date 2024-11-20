import React from 'react';

const PdfToImage = () => {
    return (
        <div className="p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">PDF to Image Converter</h2>
            <p className="text-slate-600 mb-4">Convert PDF files to image formats.</p>

            <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                    <p className="text-slate-500">Drag and drop your PDF files here</p>
                    <p className="text-sm text-slate-400">or</p>
                    <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        Browse Files
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PdfToImage; 