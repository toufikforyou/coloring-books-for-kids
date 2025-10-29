import React, { useState } from 'react';
import ColoringBookGenerator from './components/ColoringBookGenerator';
import ChatBot from './components/ChatBot';
import { BookIcon, ChatIcon, CrayonIcon } from './components/icons';

type View = 'generator' | 'chatbot';

const App: React.FC = () => {
    const [view, setView] = useState<View>('generator');

    const NavButton: React.FC<{
        active: boolean;
        onClick: () => void;
        children: React.ReactNode;
    }> = ({ active, onClick, children }) => (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform ${
                active
                    ? 'bg-violet-600 text-white shadow-lg scale-105'
                    : 'bg-white/60 text-gray-700 hover:bg-white hover:shadow-md'
            }`}
        >
            {children}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-4 sm:p-6 md:p-8">
            <header className="text-center mb-8 animate-slide-down-fade-in">
                <div className="flex justify-center items-center gap-4">
                    <CrayonIcon className="w-12 h-12 text-pink-400 transform -rotate-45" />
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-600 to-sky-500">
                        Coloring Books for Kids
                    </h1>
                </div>
                <p className="text-gray-600 mt-3 text-lg">
                    Create, Color, and Chat with Your Imagination!
                </p>
            </header>

            <nav className="flex justify-center items-center mb-8 p-1.5 bg-white/50 backdrop-blur-sm rounded-full shadow-sm max-w-xs mx-auto border border-gray-200/80 animate-slide-down-fade-in" style={{animationDelay: '150ms'}}>
                <NavButton active={view === 'generator'} onClick={() => setView('generator')}>
                    <BookIcon className="w-5 h-5"/>
                    Create Book
                </NavButton>
                <NavButton active={view === 'chatbot'} onClick={() => setView('chatbot')}>
                    <ChatIcon className="w-5 h-5"/>
                    Chat with Bot
                </NavButton>
            </nav>

            <main className="animate-fade-in" style={{animationDelay: '300ms'}}>
                {view === 'generator' ? <ColoringBookGenerator /> : <ChatBot />}
            </main>
        </div>
    );
};

export default App;