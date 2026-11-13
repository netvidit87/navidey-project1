import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="pt-2.5 pb-2.5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <span className="font-semibold text-[24px] tracking-[-1.5px] text-gray-900">
              navidey
            </span>
          </Link>
          <Link
            to="/"
            className="flex items-center px-3.5 py-1.5 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors text-sm"
          >
            Upload
          </Link>
        </div>
      </div>
    </header>
  )
}
