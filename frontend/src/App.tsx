import { QueryProvider } from "./providers/QueryProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Suspense, lazy } from "react";
import { motion } from "framer-motion";

// Lazy load components
const PhotoGrid = lazy(() =>
  import("./components/PhotoGrid").then((module) => ({
    default: module.PhotoGrid,
  }))
);
const PhotoUpload = lazy(() =>
  import("./components/PhotoUpload").then((module) => ({
    default: module.PhotoUpload,
  }))
);
const AdminPanel = lazy(() =>
  import("./components/AdminPanel").then((module) => ({
    default: module.AdminPanel,
  }))
);
const AdminLogin = lazy(() =>
  import("./components/AdminLogin").then((module) => ({
    default: module.AdminLogin,
  }))
);

// Loading component
const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-rose-500"></div>
  </div>
);

// Temporary event ID for demo purposes
const DEMO_EVENT_ID = 1;

function AdminRoute() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AdminLogin />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdminPanel eventId={DEMO_EVENT_ID} />
    </Suspense>
  );
}

function App() {
  const isAdminPage = window.location.pathname === "/admin";

  return (
    <QueryProvider>
      <AuthProvider>
        <Router>
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
                          <Link
                            to="/"
                            className="hover:text-rose-200 transition-colors"
                          >
                            Fotot e Dasmës
                          </Link>
                        </h1>
                      </div>
                      <div className="flex items-center space-x-6">
                        <Link
                          to="/"
                          className="text-white hover:text-rose-200 transition-colors font-serif tracking-wide"
                        >
                          Galeria
                        </Link>
                        <Link
                          to="/admin"
                          className="text-white hover:text-rose-200 transition-colors font-serif tracking-wide"
                        >
                          Admin
                        </Link>
                      </div>
                    </div>
                  </div>
                </nav>
                <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
                  <div className="max-w-3xl">
                    <h2 className="text-4xl sm:text-6xl font-serif italic text-white mb-6 tracking-wide">
                      Mirë se vini në Galerinë tonë të Dasmës
                    </h2>
                    <p className="text-xl text-rose-100 font-serif tracking-wider">
                      Ngarko dhe shiko fotot {"❤"}
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
                      <h1 className="text-xl font-semibold">
                        <Link to="/" className="hover:text-gray-900">
                          Fotot e Dasmës
                        </Link>
                      </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Link
                        to="/"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Galeria
                      </Link>
                      <Link
                        to="/admin"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Admin
                      </Link>
                    </div>
                  </div>
                </div>
              </nav>
            )}

            <main
              className={`max-w-[1600px] mx-auto py-6 sm:px-6 lg:px-8 ${
                !isAdminPage ? "relative z-20 bg-gray-100" : ""
              }`}
            >
              <Suspense fallback={<LoadingSpinner />}>
                <AnimatePresence mode="wait" initial={false}>
                  <Routes>
                    <Route path="/admin" element={<AdminRoute />} />
                    <Route
                      path="/"
                      element={
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <PhotoUpload eventId={DEMO_EVENT_ID} />
                          <PhotoGrid eventId={DEMO_EVENT_ID} />
                        </motion.div>
                      }
                    />
                    <Route
                      path="/photo/:photoId"
                      element={
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <PhotoGrid eventId={DEMO_EVENT_ID} isPhotoView />
                        </motion.div>
                      }
                    />
                  </Routes>
                </AnimatePresence>
              </Suspense>
            </main>

            {/* Footer with attribution */}
            <footer className="py-6 text-center text-sm text-gray-500">
              <p className="font-serif italic">
                Made with{" "}
                <span className="text-rose-500" aria-label="love">
                  ❤
                </span>{" "}
                by Blendi Maliqi
              </p>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
