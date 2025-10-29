import React, { useState, useEffect } from 'react';
import { generateColoringPages } from '../services/geminiService';
import { DownloadIcon, SparklesIcon, CrayonIcon } from './icons';

declare global {
    interface Window {
        jspdf: any;
    }
}

const loadingMessages = [
    "Mixing up the colors...",
    "Drawing cute dinosaurs...",
    "Talking to the art robots...",
    "Adding a sprinkle of magic...",
    "Building your wonderland...",
];

const LoadingSpinner: React.FC = () => {
    const [message, setMessage] = useState(loadingMessages[0]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(prev => {
                const currentIndex = loadingMessages.indexOf(prev);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 2000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center space-y-6">
            <CrayonIcon className="w-16 h-16 text-pink-500 animate-crayon-pulse" />
            <p className="text-lg text-gray-700 font-medium transition-opacity duration-500">{message}</p>
            <p className="text-sm text-gray-500">This can take a minute, so hang tight!</p>
        </div>
    );
};

const ColoringBookGenerator: React.FC = () => {
    const [theme, setTheme] = useState<string>('space dinosaurs');
    const [name, setName] = useState<string>('Alex');
    const [numPages, setNumPages] = useState<number>(5);
    const [images, setImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!theme || !name || !numPages || numPages < 1 || numPages > 10) {
            setError('Please provide a theme, a name, and a number of pages between 1 and 10.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setImages([]);

        try {
            const generatedImages = await generateColoringPages(theme, name, numPages);
            setImages(generatedImages);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPdf = () => {
        if (images.length === 0 || !window.jspdf) return;

        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait, millimeters, A4
            const a4Width = 210;
            const a4Height = 297;
            const margin = 15;
            const imgSize = a4Width - margin * 2;
            const x = margin;
            const y = (a4Height - imgSize) / 2; // Center vertically

            images.forEach((imgData, index) => {
                if (index > 0) {
                    pdf.addPage();
                }
                pdf.addImage(`data:image/jpeg;base64,${imgData}`, 'JPEG', x, y, imgSize, imgSize);
            });

            pdf.save(`${name.toLowerCase().replace(/ /g, '_')}_${theme.toLowerCase().replace(/ /g, '_')}_coloring_book.pdf`);
        } catch (e) {
            console.error("PDF generation failed", e);
            setError("Could not generate PDF. Please try again.");
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Create Your Own Coloring Book</h2>
            <p className="text-center text-gray-500 mb-8">Bring your ideas to life! What story will you create today?</p>

            <div className="space-y-6 mb-8 max-w-lg mx-auto">
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-bold text-lg">1</div>
                    <div className="flex-grow">
                        <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">Choose a Theme</label>
                        <input
                            type="text"
                            id="theme"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            placeholder="e.g., magical forest animals"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-shadow"
                            disabled={isLoading}
                        />
                    </div>
                </div>
                 <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-lg">2</div>
                    <div className="flex-grow">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Add a Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Lily"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-shadow"
                            disabled={isLoading}
                        />
                    </div>
                </div>
                 <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center font-bold text-lg">3</div>
                    <div className="flex-grow">
                        <label htmlFor="pages" className="block text-sm font-medium text-gray-700 mb-1">Pick Page Count (1-10)</label>
                        <input
                            type="number"
                            id="pages"
                            value={numPages}
                            onChange={(e) => setNumPages(Number(e.target.value))}
                            min="1"
                            max="10"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-shadow"
                            disabled={isLoading}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                 <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-3 w-full md:w-auto bg-pink-500 text-white font-bold py-3 px-8 rounded-full hover:bg-pink-600 focus:outline-none focus:ring-4 focus:ring-pink-300/50 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-100"
                >
                    <SparklesIcon className="w-6 h-6" />
                    {isLoading ? 'Creating Magic...' : 'Generate My Coloring Book'}
                </button>
            </div>

            {error && <div className="mt-6 text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</div>}

            <div className="mt-8">
                {isLoading && <LoadingSpinner />}
                {images.length > 0 && !isLoading && (
                    <div className="flex flex-col items-center">
                        <div className="w-full flex justify-between items-center mb-6">
                             <h3 className="text-2xl font-bold text-gray-800">Your Book Is Ready!</h3>
                             <button
                                onClick={handleDownloadPdf}
                                className="flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 px-6 rounded-full hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300/50 transition-all duration-300 transform hover:scale-105 active:scale-100"
                            >
                               <DownloadIcon className="w-6 h-6" />
                               Download PDF
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {images.map((img, index) => (
                                <div 
                                    key={index} 
                                    className="border border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gray-50 transform animate-pop-in"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <img src={`data:image/jpeg;base64,${img}`} alt={`Coloring page ${index + 1}`} className="w-full h-auto rounded-md" />
                                    <p className="text-center text-sm text-gray-600 mt-2 font-semibold">{index === 0 ? 'Cover Page' : `Page ${index}`}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ColoringBookGenerator;