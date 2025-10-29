
import React, { useState } from 'react';
import { generateColoringPages } from '../services/geminiService';
import { DownloadIcon, SparklesIcon } from './icons';

declare global {
    interface Window {
        jspdf: any;
    }
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-400"></div>
        <p className="text-lg text-gray-600 font-medium">Generating your magical coloring book...</p>
        <p className="text-sm text-gray-500">This can take a minute, please wait!</p>
    </div>
);

const ColoringBookGenerator: React.FC = () => {
    const [theme, setTheme] = useState<string>('space dinosaurs');
    const [name, setName] = useState<string>('Alex');
    const [images, setImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!theme || !name) {
            setError('Please provide both a theme and a name.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setImages([]);

        try {
            const generatedImages = await generateColoringPages(theme, name);
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
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Coloring Book Creator</h2>
            <p className="text-center text-gray-500 mb-6">Bring your ideas to life! Enter a theme and name to create a unique coloring book.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                    <input
                        type="text"
                        id="theme"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        placeholder="e.g., magical forest animals"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Child's Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Lily"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="flex justify-center">
                 <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 w-full md:w-auto bg-pink-500 text-white font-bold py-3 px-8 rounded-full hover:bg-pink-600 focus:outline-none focus:ring-4 focus:ring-pink-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                >
                    <SparklesIcon className="w-6 h-6" />
                    {isLoading ? 'Creating Magic...' : 'Generate My Coloring Book'}
                </button>
            </div>

            {error && <div className="mt-6 text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</div>}

            <div className="mt-8">
                {isLoading && <LoadingSpinner />}
                {images.length > 0 && (
                    <div className="flex flex-col items-center">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                            {images.map((img, index) => (
                                <div key={index} className="border-2 border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow bg-gray-50">
                                    <img src={`data:image/jpeg;base64,${img}`} alt={`Coloring page ${index + 1}`} className="w-full h-auto rounded-md" />
                                    <p className="text-center text-xs text-gray-500 mt-2 font-semibold">{index === 0 ? 'Cover Page' : `Page ${index}`}</p>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={handleDownloadPdf}
                            className="flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 px-8 rounded-full hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 transform hover:scale-105"
                        >
                           <DownloadIcon className="w-6 h-6" />
                           Download as PDF
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ColoringBookGenerator;
