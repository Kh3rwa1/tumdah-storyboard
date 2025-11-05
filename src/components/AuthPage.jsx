import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus, Loader2, Sparkles } from 'lucide-react';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#10B981]/20 via-[#34D399]/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 -left-32 w-80 h-80 bg-gradient-to-br from-[#34D399]/15 via-[#10B981]/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#10B981] to-[#34D399] rounded-2xl blur-lg opacity-50"></div>
            <img src="/images (1).png" alt="Tumdah Logo" className="relative w-16 h-16 rounded-2xl mx-auto" />
          </div>
          <h1 className="text-4xl font-black text-contrast mb-3" style={{fontFamily: 'Poppins'}}>
            <span className="gradient-text">Tumdah AI Studio</span>
          </h1>
          <p className="text-contrast/70">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        <div className="glass-card-strong p-8 space-y-6">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError('');
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
                !isSignUp
                  ? 'glass-button'
                  : 'glass-card text-contrast/60 hover:text-contrast'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError('');
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
                isSignUp
                  ? 'glass-button'
                  : 'glass-card text-contrast/60 hover:text-contrast'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
              </div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-contrast mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
                className="w-full glass-input p-3 placeholder-contrast/40 font-semibold"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-contrast mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                minLength={6}
                className="w-full glass-input p-3 placeholder-contrast/40 font-semibold"
              />
              {isSignUp && (
                <p className="text-xs text-contrast/60 mt-2">
                  Must be at least 6 characters
                </p>
              )}
            </div>

            {error && (
              <div className="glass-card p-3 bg-red-500/10 border-2 border-red-500/20">
                <p className="text-sm text-red-500 font-semibold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 glass-button font-bold disabled:opacity-40 transition-all hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Please wait...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
