import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import VideoPlayer from './pages/VideoPlayer'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Report from './pages/Report'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/v/:id" element={<VideoPlayer />} />
        <Route path="/v" element={<VideoPlayer />} />
        <Route path="/upload" element={<Home />} />
        <Route path="/terms-of-service" element={<Terms />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy-policy" element={<Privacy />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/report" element={<Report />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
