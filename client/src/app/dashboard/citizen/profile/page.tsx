
"use client";

import Profile, {
  type IProfileUpdateData,
  type IProfileUser,
} from "@/components/shared/Profile";

// Example user data.
// Replace this with your authenticated session user.
const currentUser: IProfileUser = {
  id: "user-123",
  name: "Gazi Salauddin",
  email: "user@example.com",
  address: "Dhaka, Bangladesh",
  image: "",
  role: "citizen",
};

export default function CitizenProfilePage() {
  const handleProfileUpdate = async (data: IProfileUpdateData) => {
    console.log("Updated profile:", data);

    // TODO:
    // 1. Upload data.image to Cloudinary if a new image exists.
    // 2. Get the uploaded image URL.
    // 3. Send name, address and image URL to your backend.
    // 4. Update the authenticated session/user state.
  };

  return (
    <Profile
      user={currentUser}
      onSave={handleProfileUpdate}
    />
  );
}
