import React, { useState } from 'react';
import { FiCheck } from 'react-icons/fi';

const Pricing = () => {
    const [isAnnual, setIsAnnual] = useState(false);

    const plans = [
        {
            name: "Free",
            price: "0",
            yearlyPrice: "0",
            description: "Perfect for basic image editing",
            features: [
                "Basic image conversion (HEIC, Format)",
                "Grid Cropper tool",
                "Up to 5MB file size",
                "5 operations per day",
                "Basic quality compression",
            ],
            buttonText: "Get Started",
            isPopular: false,
        },
        {
            name: "Pro",
            price: "4",
            yearlyPrice: "39",
            description: "For professionals and creators",
            features: [
                "Everything in Free",
                "Image to PDF conversion",
                "SVG to PNG/JPG conversion",
                "Batch resizing tools",
                "Up to 25MB file size",
                "Unlimited operations",
                "Priority support",
            ],
            buttonText: "Start Free Trial",
            isPopular: true,
        },
        {
            name: "Enterprise",
            price: "12",
            yearlyPrice: "119",
            description: "For teams and businesses",
            features: [
                "Everything in Pro",
                "Unlimited file size",
                "AI-powered features",
                "Advanced API access",
                "Custom integration support",
                "Dedicated account manager",
                "SLA guarantee",
            ],
            buttonText: "Contact Sales",
            isPopular: false,
        },
    ];

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
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        Simple, transparent pricing
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        Choose the perfect plan for your needs
                    </p>

                    <div className="flex items-center justify-center mt-8 space-x-4">
                        <span className={`text-sm ${!isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>Monthly</span>
                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500 transition-colors"
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                        <span className={`text-sm ${isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                            Yearly <span className="text-green-500 font-medium">(Save up to 25%)</span>
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative rounded-2xl bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 
                                shadow-lg p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
                                ${plan.isPopular ? 'ring-2 ring-blue-500 scale-105' : ''}`}
                        >
                            {plan.isPopular && (
                                <span className="absolute top-0 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-blue-600 
                                    text-white px-6 py-1.5 rounded-full text-sm font-medium shadow-lg">
                                    Most Popular
                                </span>
                            )}

                            <div className="text-center mb-8">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">{plan.description}</p>
                                <div className="flex items-center justify-center">
                                    <span className="text-5xl font-bold text-gray-900 dark:text-white">
                                        ${isAnnual ? plan.yearlyPrice : plan.price}
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-400 ml-2">
                                        /{isAnnual ? 'year' : 'month'}
                                    </span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center text-gray-600 dark:text-gray-400">
                                        <FiCheck className="w-5 h-5 text-green-500 mr-3" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`w-full py-3.5 px-6 rounded-lg font-medium transition-all duration-300 
                                    ${plan.isPopular
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {plan.buttonText}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Pricing; 