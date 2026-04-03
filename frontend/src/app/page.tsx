import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💕</span>
              <span className="text-xl font-bold text-primary-600">Dating02</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="text-gray-600 hover:text-primary-500 font-medium">
                Login
              </Link>
              <Link href="/auth/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Find Your Perfect{' '}
            <span className="text-primary-500">Connection</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with companions and potential partners. AI-powered matching ensures
            meaningful connections based on your personality, interests, and lifestyle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="btn-primary text-lg px-8 py-3">
              Start Matching
            </Link>
            <Link href="/search" className="btn-secondary text-lg px-8 py-3">
              Browse Companions
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Dating02?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="card text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.title} className="text-center">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 text-center">
        <p className="text-gray-400">© 2024 Dating02. All rights reserved.</p>
      </footer>
    </main>
  );
}

const features = [
  {
    icon: '🤖',
    title: 'AI-Powered Matching',
    description: 'Our AI analyzes personality traits, interests, and lifestyle to find your best matches.',
  },
  {
    icon: '🛡️',
    title: 'Safe & Verified',
    description: 'AI photo verification and identity checks ensure authentic profiles.',
  },
  {
    icon: '💬',
    title: 'Real-time Chat',
    description: 'Connect instantly with matches through our secure messaging platform.',
  },
];

const steps = [
  { title: 'Create Profile', description: 'Set up your profile with photos, bio, and preferences.' },
  { title: 'Discover', description: 'Browse and discover companions and matches near you.' },
  { title: 'Connect', description: 'Like, match, and start conversations with your connections.' },
  { title: 'Book & Meet', description: 'Book companions for events or dates through our platform.' },
];
