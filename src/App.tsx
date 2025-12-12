import { useState } from "react";
import QuotationOptimizer from "./QuotationOptimizer";
import { QuoteAnalyzer } from "./version2";

function App() {
  const [version, setVersion] = useState<"v1" | "v2">("v2");

  return (
    <>
      {/* Version Toggle - Fixed at top right */}
      <div className="fixed top-4 right-4 z-50 flex items-center bg-white/90 backdrop-blur-sm rounded-full p-1 border border-slate-200 shadow-lg">
        <button
          onClick={() => setVersion("v1")}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
            version === "v1"
              ? "bg-indigo-600 text-white"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          V1 - Original
        </button>
        <button
          onClick={() => setVersion("v2")}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
            version === "v2"
              ? "bg-cyan-600 text-white"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          V2 - Real-Time
        </button>
      </div>

      {/* Render selected version */}
      {version === "v1" ? <QuotationOptimizer /> : <QuoteAnalyzer />}
    </>
  );
}

export default App;
