import { AuthProvider } from "./contexts/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppContent from "./components/AppContent";
import AdminRoute from "./components/AdminRoute";

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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
