import { lazy, Suspense } from "react";
import { DEMO_EVENT_ID } from "../App";
import { useAuth } from "../contexts/AuthContext";
import { Navigation } from "./Navigation";
import { Layout } from "./Layout";

import { LoadingSpinner } from "./LoadingSpinner";

const AdminPanel = lazy(() =>
  import("./AdminPanel").then((module) => ({
    default: module.AdminPanel,
  }))
);
const AdminLogin = lazy(() =>
  import("./AdminLogin").then((module) => ({
    default: module.AdminLogin,
  }))
);

function AdminRoute() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <>
        <div className="bg-gray-50">
          <Navigation isLight={true} />
        </div>
        <Suspense fallback={<LoadingSpinner />}>
          <AdminLogin />
        </Suspense>
      </>
    );
  }

  return (
    <>
      <div className="bg-gray-50">
        <Navigation isLight={true} />
      </div>
      <Layout isAdminPage={true}>
        <Suspense fallback={<LoadingSpinner />}>
          <AdminPanel eventId={DEMO_EVENT_ID} />
        </Suspense>
      </Layout>
    </>
  );
}

export default AdminRoute;
