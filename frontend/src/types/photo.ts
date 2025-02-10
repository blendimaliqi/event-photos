export type UploadStatus = "idle" | "uploading" | "success" | "error";

export interface PhotoUploadResponse {
  id: number;
  url: string;
  // Add other response fields as needed
}
