import React, { useState } from 'react';
import { Card, Badge, TabGroup, Tab, CodeBlock } from '../ui';

const APIDocs = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const apiEndpoints = {
        resize: [
            {
                id: 'grid-cropper',
                title: "Grid Cropper API",
                description: "Split images into grid segments",
                icon: "📏",
                method: 'POST',
                path: '/api/v1/resize/grid',
                parameters: [
                    { name: 'image', type: 'file', required: true, description: 'Image file to split' },
                    { name: 'rows', type: 'number', required: true, description: 'Number of rows in grid' },
                    { name: 'cols', type: 'number', required: true, description: 'Number of columns in grid' },
                    { name: 'square', type: 'boolean', required: false, description: 'Force square grid' }
                ]
            },
            {
                id: 'batch-resize',
                title: "Batch Resize API",
                description: "Resize multiple images at once",
                icon: "📦",
                method: 'POST',
                path: '/api/v1/resize/batch',
                parameters: [
                    { name: 'images', type: 'array', required: true, description: 'Array of image files' },
                    { name: 'width', type: 'number', required: true, description: 'Target width' },
                    { name: 'height', type: 'number', required: true, description: 'Target height' }
                ]
            },
            // Add other resize endpoints...
        ],
        conversion: [
            {
                id: 'format-converter',
                title: "Format Converter API",
                description: "Convert between image formats",
                icon: "🔄",
                method: 'POST',
                path: '/api/v1/convert/format',
                parameters: [
                    { name: 'image', type: 'file', required: true, description: 'Image file to convert' },
                    { name: 'format', type: 'string', required: true, description: 'Target format (jpg, png, etc)' },
                    { name: 'quality', type: 'number', required: false, description: 'Output quality (1-100)' }
                ]
            },
            {
                id: 'heic-converter',
                title: "HEIC Converter API",
                description: "Convert HEIC to JPG",
                icon: "📱",
                method: 'POST',
                path: '/api/v1/convert/heic',
                parameters: [
                    { name: 'image', type: 'file', required: true, description: 'HEIC file to convert' },
                    { name: 'quality', type: 'number', required: false, description: 'JPG quality (1-100)' }
                ]
            },
            // Add other conversion endpoints...
        ]
    };

    const allEndpoints = [...apiEndpoints.resize, ...apiEndpoints.conversion];
    const filteredEndpoints = allEndpoints.filter(endpoint =>
        endpoint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
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

            <div className="container mx-auto px-4 py-12 relative">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="mb-12">
                        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                            API Reference
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-mono">
                                v1.0.0
                            </span>
                            <span>•</span>
                            <a href="#" className="hover:text-blue-500 transition-colors">
                                Changelog
                            </a>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mb-8">
                        <div className="relative max-w-md">
                            <input
                                type="text"
                                placeholder="Search endpoints..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                                         rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600
                                         dark:focus:border-blue-600 outline-none"
                            />
                            <svg className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-6">
                        {/* Authentication Section */}
                        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="p-6">
                                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                    Authentication
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    All API requests require authentication using Bearer token scheme.
                                </p>
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4">
                                    <CodeBlock
                                        language="bash"
                                        code={`curl -H "Authorization: Bearer YOUR_API_KEY" https://api.imagetools.xyz/v1/resize/grid`}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Endpoints */}
                        {filteredEndpoints.map((endpoint) => (
                            <Card key={endpoint.id} className="border border-gray-200 dark:border-gray-700 shadow-sm">
                                <div className="p-6">
                                    <div className="flex items-center gap-4 mb-6">
                                        <Badge
                                            color={endpoint.method === 'GET' ? 'green' : 'blue'}
                                            label={endpoint.method}
                                            className="font-mono text-xs"
                                        />
                                        <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                                            {endpoint.path}
                                        </code>
                                    </div>

                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                        {endpoint.description}
                                    </p>

                                    <TabGroup>
                                        <Tab label="Parameters">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="bg-gray-50 dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-700">
                                                            <th className="px-4 py-2 text-left font-medium text-gray-900 dark:text-gray-100">Parameter</th>
                                                            <th className="px-4 py-2 text-left font-medium text-gray-900 dark:text-gray-100">Type</th>
                                                            <th className="px-4 py-2 text-left font-medium text-gray-900 dark:text-gray-100">Required</th>
                                                            <th className="px-4 py-2 text-left font-medium text-gray-900 dark:text-gray-100">Description</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                        {endpoint.parameters.map((param) => (
                                                            <tr key={param.name}>
                                                                <td className="px-4 py-2 font-mono text-xs text-blue-600 dark:text-blue-400">
                                                                    {param.name}
                                                                </td>
                                                                <td className="px-4 py-2 font-mono text-xs text-gray-600 dark:text-gray-400">
                                                                    {param.type}
                                                                </td>
                                                                <td className="px-4 py-2">
                                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                                                                        ${param.required
                                                                            ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                                            : 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                                        }`}>
                                                                        {param.required ? 'Required' : 'Optional'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                                                                    {param.description}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </Tab>

                                        <Tab label="Example">
                                            <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4">
                                                <CodeBlock
                                                    language="bash"
                                                    code={`curl -X ${endpoint.method} "https://api.imagetools.xyz${endpoint.path}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: multipart/form-data" \\
  -F "image=@image.jpg"`}
                                                />
                                            </div>
                                        </Tab>

                                        <Tab label="Response">
                                            <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4">
                                                <CodeBlock
                                                    language="json"
                                                    code={`{
  "success": true,
  "data": {
    "url": "https://imagetools.xyz/processed/image.jpg",
    "processedAt": "2024-03-20T12:00:00Z"
  }
}`}
                                                />
                                            </div>
                                        </Tab>
                                    </TabGroup>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default APIDocs;
