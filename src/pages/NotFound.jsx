import { Link } from 'react-router-dom'
import Header from '../components/Header'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <div className="flex-grow flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">404</h1>
          <p className="text-gray-600">Page not found</p>
          <Link
            to="/"
            className="inline-flex px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 text-sm"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
