import { useState, createContext, useContext } from "react";
import { Sun, Moon } from "lucide-react";
import QuotationOptimizer from "./QuotationOptimizer";
import { QuoteAnalyzer } from "./version2";
import { useTheme } from "./ThemeContext";

// Export theme context for child components
export const ThemeStateContext = createContext<'light' | 'dark'>('light');
export const useThemeState = () => useContext(ThemeStateContext);

function App() {
  const [version, setVersion] = useState<"v1" | "v2">("v2");
  const { theme, toggleTheme } = useTheme();
  
  const isDark = theme === 'dark';

  return (
    <ThemeStateContext.Provider value={theme}>
      <div 
        className="min-h-screen transition-colors duration-300"
        style={{
          backgroundColor: isDark ? '#0f172a' : '#f8fafc',
          color: isDark ? '#f1f5f9' : '#1e293b'
        }}
      >
        {/* Controls - Fixed at top right */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: isDark ? '#334155' : '#e2e8f0'
            }}
            className="p-2.5 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group border"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <Sun size={18} className="text-amber-400 group-hover:text-amber-300 transition-colors" />
            ) : (
              <Moon size={18} className="text-slate-600 group-hover:text-indigo-600 transition-colors" />
            )}
          </button>

          {/* Version Toggle */}
          <div 
            style={{
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: isDark ? '#334155' : '#e2e8f0'
            }}
            className="flex items-center backdrop-blur-sm rounded-full p-1 shadow-lg border"
          >
            <button
              onClick={() => setVersion("v1")}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                version === "v1"
                  ? "bg-indigo-600 text-white"
                  : ""
              }`}
              style={version !== "v1" ? { color: isDark ? '#94a3b8' : '#64748b' } : {}}
            >
              V1 - Original
            </button>
            <button
              onClick={() => setVersion("v2")}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                version === "v2"
                  ? "bg-cyan-600 text-white"
                  : ""
              }`}
              style={version !== "v2" ? { color: isDark ? '#94a3b8' : '#64748b' } : {}}
            >
              V2 - Real-Time
            </button>
          </div>
        </div>

        {/* Render selected version */}
        {version === "v1" ? <QuotationOptimizer /> : <QuoteAnalyzer />}
      </div>
    </ThemeStateContext.Provider>
  );
}

export default App;
