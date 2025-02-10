import { QueryProvider } from "./providers/QueryProvider";
import { PhotoGrid } from "./components/PhotoGrid";
import { PhotoUpload } from "./components/PhotoUpload";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminPanel } from "./components/AdminPanel";
import { AdminLogin } from "./components/AdminLogin";
import { useAuth } from "./contexts/AuthContext";

// Temporary event ID for demo purposes
const DEMO_EVENT_ID = 1;

function AdminRoute() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <AdminLogin />;
  }

  return <AdminPanel eventId={DEMO_EVENT_ID} />;
}

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-100">
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold">Wedding Photos</h1>
                </div>
                <div className="flex items-center space-x-4">
                  <a href="/" className="text-gray-600 hover:text-gray-900">
                    Gallery
                  </a>
                  <a
                    href="/admin"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Admin
                  </a>
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-[1600px] mx-auto py-6 sm:px-6 lg:px-8">
            {window.location.pathname === "/admin" ? (
              <AdminRoute />
            ) : (
              <>
                <PhotoUpload eventId={DEMO_EVENT_ID} />
                <PhotoGrid eventId={DEMO_EVENT_ID} />
              </>
            )}
          </main>
        </div>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
