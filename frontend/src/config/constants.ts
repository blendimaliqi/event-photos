// File size limits (matching backend)
export const FILE_SIZE_LIMITS = {
  // 100MB video file size limit (defined in backend FileStorageService.cs)
  MAX_VIDEO_SIZE_BYTES: 104857600,
  MAX_VIDEO_SIZE_MB: 100,

  // 500MB total video size per event (defined in backend VideoController.cs)
  MAX_TOTAL_VIDEO_SIZE_PER_EVENT_BYTES: 524288000,
  MAX_TOTAL_VIDEO_SIZE_PER_EVENT_MB: 500,
};

// Helper function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  } else {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
}
