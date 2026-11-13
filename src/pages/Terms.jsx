import { Link } from 'react-router-dom'
import Header from '../components/Header'

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>By using Navidey you agree to these terms.</p>
          <h2 className="text-xl font-semibold text-gray-900">1. Service</h2>
          <p>Navidey provides free simple video hosting. Use is at your own risk.</p>
          <h2 className="text-xl font-semibold text-gray-900">2. Acceptable use</h2>
          <p>Do not upload illegal, harmful, or infringing content. Violations may result in removal.</p>
          <h2 className="text-xl font-semibold text-gray-900">3. Contact</h2>
          <p>legal@navidey.site</p>
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
