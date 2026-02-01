import { LogIn } from 'lucide-react';

export default function Login() {
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement authentication
    console.log('Login submitted');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            CC
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Callvia Certo</h1>
          <p className="text-gray-600 mt-2">
            Multi-Tenant Compliance & Verification Platform
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="input"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 text-primary-600 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <a href="#" className="text-sm text-primary-600 hover:text-primary-700">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="btn btn-primary w-full flex items-center justify-center">
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
            Contact Sales
          </a>
        </div>
      </div>
    </div>
  );
}
