import { useMutation, useQueryClient } from "@tanstack/react-query";
import { photoService } from "../services/photoService";
import { QUERY_KEYS } from "./usePhotos";

interface UploadPhotoParams {
  file: File;
  eventId: string;
}

export function usePhotoUpload(eventId: number) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ file, eventId: eventIdString }: UploadPhotoParams) =>
      photoService.uploadPhoto(file, eventIdString),
    onSuccess: () => {
      // Invalidate and refetch photos query after successful upload
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.photos(eventId) });
    },
  });

  const uploadPhoto = async (file: File, eventIdString: string) => {
    if (!file.type.startsWith("image/")) {
      throw new Error("Only image files are allowed");
    }

    return mutation.mutateAsync({ file, eventId: eventIdString });
  };

  return {
    uploadPhoto,
    isUploading: mutation.isPending,
    error: mutation.error,
  };
}
