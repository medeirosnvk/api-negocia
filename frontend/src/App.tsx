import { useState, createContext, useContext, useEffect } from 'react';
import { ChatWindow } from './components/ChatWindow';

export const ThemeContext = createContext({
  theme: 'dark' as 'dark' | 'light',
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="h-full lucia-bg noise-overlay flex items-center justify-center p-4 md:p-8">
        <ChatWindow />
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
