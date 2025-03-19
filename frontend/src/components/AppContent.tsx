import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, Suspense, lazy, useCallback } from "react";
import { useLocation, Routes, Route } from "react-router-dom";
import { useEvent } from "../hooks/useEvent";
import { HeroSection } from "./HeroSection";
import { Layout } from "./Layout";
import { LoadingSpinner } from "./LoadingSpinner";

import { DEMO_EVENT_ID } from "../App";
import AdminRoute from "./AdminRoute";

// Pre-load MediaGrid to avoid lazy-loading delay on photo view
import { MediaGrid } from "./MediaGrid";

// Import LightGallery styles at the app root level for faster page transitions
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-video.css";

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
  const [isMobile, setIsMobile] = useState(false);

  // Add debug on mount
  useEffect(() => {
    console.log(`[AppContent] Initializing, path: ${location.pathname}`);
    if (isPhotoViewPage) {
      console.log(
        `[AppContent] Starting in photo view mode: ${location.pathname}`
      );
    }
  }, []);

  // Detect mobile on mount
  useEffect(() => {
    const isMobileDevice =
      window.innerWidth < 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    setIsMobile(isMobileDevice);
    console.log(`[AppContent] Mobile device detected: ${isMobileDevice}`);
  }, []);

  // Listen for navigation events
  useEffect(() => {
    const handleNavigationStart = () => {
      console.log("[AppContent] Navigation started");
      setIsNavigating(true);
    };
    const handleNavigationEnd = () => {
      console.log("[AppContent] Navigation ended");
      setIsNavigating(false);
    };

    window.addEventListener("navigationStart", handleNavigationStart);
    window.addEventListener("navigationEnd", handleNavigationEnd);

    return () => {
      window.removeEventListener("navigationStart", handleNavigationStart);
      window.removeEventListener("navigationEnd", handleNavigationEnd);
    };
  }, []);

  // Watch for location changes
  useEffect(() => {
    console.log(`[AppContent] Location changed: ${location.pathname}`);
  }, [location.pathname]);

  // Memoize components to reduce re-renders
  const renderPhotoView = useCallback(() => {
    console.log("[AppContent] Rendering photo view component");
    return <MediaGrid eventId={DEMO_EVENT_ID} isMediaView />;
  }, []);

  const renderMainView = useCallback(() => {
    console.log("[AppContent] Rendering main view component");
    return (
      <>
        <PhotoUpload eventId={DEMO_EVENT_ID} />
        <MediaGrid eventId={DEMO_EVENT_ID} />
      </>
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Only show hero section if not navigating */}
      {!isNavigating &&
        (!isMobile ? (
          // Use AnimatePresence only on desktop
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
        ) : (
          // Simplified rendering for mobile
          <HeroSection
            event={event}
            isAdmin={isAdminPage}
            isPhotoView={isPhotoViewPage}
          />
        ))}

      <Layout isAdminPage={isAdminPage}>
        <Suspense fallback={<LoadingSpinner />}>
          {isMobile ? (
            // Use simpler routing for mobile
            <Routes>
              <Route path="/admin" element={<AdminRoute />} />
              <Route path="/" element={renderMainView()} />
              <Route path="/photo/:photoId" element={renderPhotoView()} />
            </Routes>
          ) : (
            // Use animations only on desktop
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
                      {renderMainView()}
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
                      {renderPhotoView()}
                    </motion.div>
                  }
                />
              </Routes>
            </AnimatePresence>
          )}
        </Suspense>
      </Layout>
    </div>
  );
}

export default AppContent;
