import { Link } from 'react-router-dom'
import Header from '../components/Header'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>We collect limited technical data to operate the service (e.g. IP, device).</p>
          <h2 className="text-xl font-semibold text-gray-900">Contact</h2>
          <p>privacy@navidey.site</p>
        </div>
        <div className="mt-12">
          <Link to="/" className="text-gray-900 font-medium hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
