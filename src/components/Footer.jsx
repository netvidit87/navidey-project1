import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="pb-4 pt-2">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-center space-x-6">
          <Link
            to="/terms-of-service"
            className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            to="/report"
            className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            Report Abuse
          </Link>
        </div>
      </div>
    </footer>
  )
}
