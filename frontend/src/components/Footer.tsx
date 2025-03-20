import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="py-6 mt-8 text-center text-gray-600">
      <div className="italic font-medium">
        Made with{" "}
        <span className="text-xl inline-block transform hover:scale-125 transition-transform duration-300">
          ❤️
        </span>{" "}
        by Blendi Maliqi
      </div>
    </footer>
  );
};

export default Footer;
