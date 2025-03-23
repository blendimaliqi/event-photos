import { AuthProvider } from "./contexts/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AdminRoute from "./components/AdminRoute";
import AppContent from "./components/AppContent";
import VideoThumbnailTest from "./utils/VideoThumbnailTest";

// Temporary event ID for demo purposes
export const DEMO_EVENT_ID = 1;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="/:mediaType/:mediaId" element={<AppContent />} />
          <Route path="/admin" element={<AdminRoute />} />
          <Route path="/test-thumbnails" element={<VideoThumbnailTest />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
