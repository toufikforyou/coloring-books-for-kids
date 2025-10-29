
import React, { useState } from 'react';
import ColoringBookGenerator from './components/ColoringBookGenerator';
import ChatBot from './components/ChatBot';
import { BookIcon, ChatIcon } from './components/icons';

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
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                active
                    ? 'bg-violet-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
        >
            {children}
        </button>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 font-sans p-4 sm:p-6 md:p-8">
            <header className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
                    Gemini Creations for Kids
                </h1>
                <p className="text-gray-600 mt-2">Personalized Coloring Books & Friendly Chat</p>
            </header>

            <nav className="flex justify-center items-center mb-8 p-2 bg-white/50 backdrop-blur-sm rounded-full shadow-sm max-w-xs mx-auto">
                <NavButton active={view === 'generator'} onClick={() => setView('generator')}>
                    <BookIcon className="w-5 h-5"/>
                    Coloring Book
                </NavButton>
                <NavButton active={view === 'chatbot'} onClick={() => setView('chatbot')}>
                    <ChatIcon className="w-5 h-5"/>
                    Chat Bot
                </NavButton>
            </nav>

            <main>
                {view === 'generator' ? <ColoringBookGenerator /> : <ChatBot />}
            </main>
        </div>
    );
};

export default App;
