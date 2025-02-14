import { lazy, Suspense } from "react";
import { DEMO_EVENT_ID } from "../App";
import { useAuth } from "../contexts/AuthContext";

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

export default AdminRoute;
