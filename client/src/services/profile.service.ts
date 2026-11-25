import { apiUrl, parseApiResponse } from "./api";
import type {
  IProfileUpdateData,
  IProfileUser,
} from "@/components/shared/Profile";

interface ProfileUpdateResponse {
  success: boolean;
  message: string;
  data: IProfileUser;
}

export const updateMaintenanceProfile = async (
  profile: IProfileUpdateData
): Promise<ProfileUpdateResponse> => {
  const formData = new FormData();
  formData.append("name", profile.name);
  formData.append("address", profile.address);
  formData.append("removeImage", String(profile.removeImage));

  if (profile.image) {
    formData.append("image", profile.image);
  }

  const response = await fetch(apiUrl("maintenance/profile"), {
    method: "PATCH",
    credentials: "include",
    body: formData,
  });

  return parseApiResponse<ProfileUpdateResponse>(response);
};
