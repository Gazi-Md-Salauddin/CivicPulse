import cloudinary from "../config/cloudinary.js";

export interface CloudinaryImage {
  secure_url: string;
  public_id: string;
}

export const uploadImageBuffer = (
  buffer: Buffer,
  folder: string
): Promise<CloudinaryImage> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary image upload failed."));
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    stream.end(buffer);
  });

export const deleteCloudinaryImages = async (
  publicIds: string[]
) => {
  const results = await Promise.allSettled(
    publicIds.map((publicId) => cloudinary.uploader.destroy(publicId))
  );

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `Cloudinary cleanup failed for ${publicIds[index]}:`,
        result.reason
      );
    }
  });
};
