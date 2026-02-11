import { useState, useEffect } from 'react';
import { ThemeContext } from './contexts/ThemeContext';
import { ChatScreen } from './screens/ChatScreen';

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
        <ChatScreen />
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
