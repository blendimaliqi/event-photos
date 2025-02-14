import { Link } from "react-router-dom";

interface NavigationProps {
  isLight?: boolean;
}

export const Navigation = ({ isLight = false }: NavigationProps) => {
  const textColorClass = isLight ? "text-gray-900" : "text-white";
  const hoverColorClass = isLight
    ? "hover:text-rose-500"
    : "hover:text-rose-200";

  return (
    <nav className="relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <h1
              className={`text-2xl font-serif italic ${textColorClass} tracking-wide`}
            >
              <Link to="/" className={`${hoverColorClass} transition-colors`}>
                Fotot e Dasmës
              </Link>
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className={`${textColorClass} ${hoverColorClass} transition-colors font-serif tracking-wide`}
            >
              Galeria
            </Link>
            <Link
              to="/admin"
              className={`${textColorClass} ${hoverColorClass} transition-colors font-serif tracking-wide`}
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
