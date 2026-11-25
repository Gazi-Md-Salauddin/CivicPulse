import type { Request, Response } from "express";
import type { PoolClient } from "pg";
import pool from "../config/db.js";
import {
  deleteCloudinaryImages,
  uploadImageBuffer,
} from "../lib/cloudinaryImages.js";

type ProfileImageMime = "image/jpeg" | "image/png" | "image/webp";

const detectImageMimeType = (
  file: Express.Multer.File
): ProfileImageMime | null => {
  const buffer = file.buffer;

  if (
    file.mimetype === "image/jpeg" &&
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }

  if (
    file.mimetype === "image/png" &&
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    )
  ) {
    return "image/png";
  }

  if (
    file.mimetype === "image/webp" &&
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
};

const getManagedProfilePublicId = (imageUrl: string | null) => {
  if (!imageUrl) return null;

  try {
    const url = new URL(imageUrl);
    if (url.hostname !== "res.cloudinary.com") return null;

    const segments = url.pathname.split("/").filter(Boolean);
    const uploadIndex = segments.indexOf("upload");
    if (uploadIndex < 0) return null;

    const assetSegments = segments.slice(uploadIndex + 1);
    if (/^v\d+$/.test(assetSegments[0] ?? "")) {
      assetSegments.shift();
    }

    const publicId = assetSegments
      .map((segment) => decodeURIComponent(segment))
      .join("/")
      .replace(/\.[a-z0-9]+$/i, "");

    return publicId.startsWith("civicpulse/profiles/")
      ? publicId
      : null;
  } catch {
    return null;
  }
};

export const updateProfileController = async (
  req: Request,
  res: Response
) => {
  const userId = res.locals.session.user.id;
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const address =
    typeof req.body?.address === "string" ? req.body.address.trim() : "";
  const removeImage = req.body?.removeImage === "true";
  const file = req.file;

  if (file && removeImage) {
    return res.status(400).json({
      success: false,
      message: "Choose a profile photo or remove the current photo, not both.",
    });
  }

  if (!name || name.length > 200 || address.length > 2000) {
    return res.status(400).json({
      success: false,
      message: "Name is required and address must be 2000 characters or fewer.",
    });
  }

  if (file && !detectImageMimeType(file)) {
    return res.status(400).json({
      success: false,
      message: "Profile photos must be valid JPEG, PNG, or WEBP images.",
    });
  }

  let uploadedPublicId: string | null = null;
  let committed = false;
  let oldImage: string | null = null;
  let client: PoolClient | null = null;

  try {
    let imageUrl: string | null | undefined;
    if (file) {
      const uploaded = await uploadImageBuffer(
        file.buffer,
        "civicpulse/profiles"
      );
      imageUrl = uploaded.secure_url;
      uploadedPublicId = uploaded.public_id;
    } else if (removeImage) {
      imageUrl = null;
    }

    client = await pool.connect();
    await client.query("BEGIN");

    const userResult = await client.query(
      `SELECT image
       FROM "user"
       WHERE id = $1
       FOR UPDATE`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      await client.query("ROLLBACK");
      client.release();
      client = null;
      if (uploadedPublicId) {
        await deleteCloudinaryImages([uploadedPublicId]);
        uploadedPublicId = null;
      }
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    oldImage = userResult.rows[0].image;
    const updatedResult = await client.query(
      `UPDATE "user"
       SET name = $1,
           address = $2,
           image = CASE
             WHEN $3::boolean THEN NULL
             ELSE COALESCE($4::text, image)
           END,
           "updatedAt" = NOW()
       WHERE id = $5
       RETURNING id, name, email, address, image, role`,
      [name, address, removeImage, imageUrl ?? null, userId]
    );

    await client.query("COMMIT");
    committed = true;
    client.release();
    client = null;

    const updatedUser = updatedResult.rows[0];
    if (oldImage && oldImage !== updatedUser.image) {
      const oldPublicId = getManagedProfilePublicId(oldImage);
      if (oldPublicId) {
        await deleteCloudinaryImages([oldPublicId]);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Profile settings updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Profile update rollback failed:", rollbackError);
      }
      client.release();
    }

    if (uploadedPublicId && !committed) {
      await deleteCloudinaryImages([uploadedPublicId]);
    }

    console.error("Profile update failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile settings.",
    });
  }
};
