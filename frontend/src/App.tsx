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
  const isAdminPage = window.location.pathname === "/admin";

  return (
    <QueryProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-100">
          {!isAdminPage && (
            <div className="relative h-[90vh] bg-black">
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: 'url("/wedphoto.jpg")',
                  backgroundPosition: "center 35%",
                }}
              >
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-b from-transparent to-gray-100" />
              </div>
              <nav className="relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between h-20">
                    <div className="flex items-center">
                      <h1 className="text-2xl font-serif italic text-white tracking-wide">
                        Wedding Photos
                      </h1>
                    </div>
                    <div className="flex items-center space-x-6">
                      <a
                        href="/"
                        className="text-white hover:text-rose-200 transition-colors font-serif tracking-wide"
                      >
                        Gallery
                      </a>
                      <a
                        href="/admin"
                        className="text-white hover:text-rose-200 transition-colors font-serif tracking-wide"
                      >
                        Admin
                      </a>
                    </div>
                  </div>
                </div>
              </nav>
              <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
                <div className="max-w-3xl">
                  <h2 className="text-4xl sm:text-6xl font-serif italic text-white mb-6 tracking-wide">
                    Welcome to our Wedding Gallery
                  </h2>
                  <p className="text-xl text-rose-100 font-serif tracking-wider">
                    Upload and view photos {"❤"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {isAdminPage && (
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
          )}

          <main
            className={`max-w-[1600px] mx-auto py-6 sm:px-6 lg:px-8 ${
              !isAdminPage ? "-mt-16 relative z-20" : ""
            }`}
          >
            {isAdminPage ? (
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
