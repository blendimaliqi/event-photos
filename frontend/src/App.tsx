import { AuthProvider } from "./contexts/AuthContext";
import { BrowserRouter as Router } from "react-router-dom";
import AppContent from "./components/AppContent";

// Temporary event ID for demo purposes
export const DEMO_EVENT_ID = 1;

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
