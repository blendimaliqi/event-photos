import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, Suspense, lazy } from "react";
import { useLocation, Routes, Route } from "react-router-dom";
import { useEvent } from "../hooks/useEvent";
import { HeroSection } from "./HeroSection";
import { Layout } from "./Layout";
import { LoadingSpinner } from "./LoadingSpinner";

import { DEMO_EVENT_ID } from "../App";
import AdminRoute from "./AdminRoute";

const PhotoGrid = lazy(() =>
  import("./PhotoGrid").then((module) => ({
    default: module.PhotoGrid,
  }))
);
const PhotoUpload = lazy(() =>
  import("./PhotoUpload").then((module) => ({
    default: module.PhotoUpload,
  }))
);
function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname === "/admin";
  const isPhotoViewPage = location.pathname.startsWith("/photo/");
  const { data: event } = useEvent(DEMO_EVENT_ID);
  const [isNavigating, setIsNavigating] = useState(false);

  // Listen for navigation events
  useEffect(() => {
    const handleNavigationStart = () => setIsNavigating(true);
    const handleNavigationEnd = () => setIsNavigating(false);

    window.addEventListener("navigationStart", handleNavigationStart);
    window.addEventListener("navigationEnd", handleNavigationEnd);

    return () => {
      window.removeEventListener("navigationStart", handleNavigationStart);
      window.removeEventListener("navigationEnd", handleNavigationEnd);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Only show hero section if not navigating */}
      {!isNavigating && (
        <AnimatePresence mode="wait">
          {!isAdminPage && !isPhotoViewPage ? (
            <HeroSection event={event} />
          ) : (
            <HeroSection
              event={event}
              isAdmin={isAdminPage}
              isPhotoView={isPhotoViewPage}
            />
          )}
        </AnimatePresence>
      )}

      <Layout isAdminPage={isAdminPage}>
        <Suspense fallback={<LoadingSpinner />}>
          <AnimatePresence mode="wait" initial={false}>
            <Routes>
              <Route path="/admin" element={<AdminRoute />} />
              <Route
                path="/"
                element={
                  <motion.div
                    key="home"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PhotoUpload eventId={DEMO_EVENT_ID} />
                    <Suspense fallback={<LoadingSpinner />}>
                      <PhotoGrid eventId={DEMO_EVENT_ID} />
                    </Suspense>
                  </motion.div>
                }
              />
              <Route
                path="/photo/:photoId"
                element={
                  <motion.div
                    key="photo-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Suspense fallback={<LoadingSpinner />}>
                      <PhotoGrid eventId={DEMO_EVENT_ID} isPhotoView />
                    </Suspense>
                  </motion.div>
                }
              />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </Layout>
    </div>
  );
}

export default AppContent;
