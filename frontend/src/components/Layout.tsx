import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  isAdminPage?: boolean;
}

export const Layout = ({ children, isAdminPage }: LayoutProps) => {
  return (
    <>
      <main
        className={`max-w-[1600px] mx-auto py-6 sm:px-6 lg:px-8 ${
          !isAdminPage ? "relative z-20 bg-gray-100" : ""
        }`}
      >
        {children}
      </main>

      <footer className="py-6 text-center text-sm text-gray-500">
        <p className="font-serif italic">
          Made with{" "}
          <span className="text-rose-500" aria-label="love">
            ❤
          </span>{" "}
          by Blendi Maliqi
        </p>
      </footer>
    </>
  );
};
