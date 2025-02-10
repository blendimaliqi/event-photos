import React from "react";
import { Photo } from "../types/photo";

interface PhotoContentProps {
  photo: Photo;
}

export const PhotoContent: React.FC<PhotoContentProps> = ({ photo }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4">
      <p className="text-sm text-gray-600">
        {new Date(photo.uploadDate).toLocaleDateString()}{" "}
        {new Date(photo.uploadDate).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
      <p className="text-gray-700 my-2">
        {photo.description || "A beautiful wedding moment"}
      </p>
    </div>
  );
};
