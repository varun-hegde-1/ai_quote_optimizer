import { Loader2, Sparkles } from 'lucide-react';
import { useTheme } from '../../ThemeContext';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Fetching real-time data..." 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div 
          className="w-16 h-16 border-4 rounded-full animate-spin"
          style={{
            borderColor: isDark ? '#475569' : '#e2e8f0',
            borderTopColor: isDark ? '#22d3ee' : '#06b6d4'
          }}
        />
        <Sparkles 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" 
          size={24}
          style={{ color: isDark ? '#22d3ee' : '#0891b2' }}
        />
      </div>
      <p className="mt-4 animate-pulse" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>{message}</p>
    </div>
  );
};

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9' }}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: isDark ? '#e2e8f0' : '#334155' }}>{title}</h3>
      <p className="text-sm max-w-md" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{description}</p>
    </div>
  );
};

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2' }}
      >
        <Loader2 style={{ color: isDark ? '#f87171' : '#dc2626' }} size={24} />
      </div>
      <p className="text-sm mb-4" style={{ color: isDark ? '#f87171' : '#dc2626' }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm rounded-lg transition-colors border"
          style={{
            backgroundColor: isDark ? '#334155' : '#e2e8f0',
            color: isDark ? '#e2e8f0' : '#334155',
            borderColor: isDark ? '#475569' : '#cbd5e1'
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
};
