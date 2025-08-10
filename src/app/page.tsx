export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Wingspan Yoga
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            Transform your practice with our online yoga classes and in-studio
            sessions. Join our community of mindful practitioners on a journey
            of wellness and self-discovery.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-3xl mb-4">🧘‍♀️</div>
              <h3 className="text-xl font-semibold mb-2">Video Library</h3>
              <p className="text-gray-600">
                Access hundreds of yoga classes anytime, anywhere
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-3xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2">Live Classes</h3>
              <p className="text-gray-600">
                Join live sessions with certified instructors
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-3xl mb-4">💫</div>
              <h3 className="text-xl font-semibold mb-2">
                Personalized Journey
              </h3>
              <p className="text-gray-600">
                Customized recommendations for your practice
              </p>
            </div>
          </div>

          <div className="mt-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border">
              <h2 className="text-2xl font-semibold mb-4">
                🚀 Development Status
              </h2>
              <div className="text-left max-w-2xl mx-auto">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✅</span>
                    <span>Next.js 14+ project initialized</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✅</span>
                    <span>TypeScript configuration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✅</span>
                    <span>Tailwind CSS setup</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✅</span>
                    <span>ESLint & Prettier configuration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✅</span>
                    <span>Project folder structure</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✅</span>
                    <span>Basic types and utilities</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-500">⏳</span>
                    <span>Database setup (next step)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-500">⏳</span>
                    <span>Authentication system (next step)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
