import type { Request, Response } from "express";

import pool from "../config/db.js";
import {
    deleteCloudinaryImages,
    uploadImageBuffer,
    type CloudinaryImage,
} from "../lib/cloudinaryImages.js";

export const uploadIssueImages = async (
    req: Request,
    res: Response
) => {
    const uploadedImages: CloudinaryImage[] = [];

    try {
        const userId = res.locals.session.user.id;
        const { issueId } = req.params;

        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please select at least one image",
            });
        }

        // 2. Check issue ownership
        const issueResult = await pool.query(
            `SELECT id FROM reportissues
             WHERE id = $1 AND reporter_id = $2`,
            [issueId, userId]
        );

        if (issueResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Issue not found or access denied",
            });
        }

        // 3. Upload images to Cloudinary
        for (const file of files) {
            const buffer = file.buffer;

            const image = await uploadImageBuffer(
                buffer,
                "civicpulse/issues"
            );

            uploadedImages.push(image);
        }

        // 4. Save image information in PostgreSQL
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const savedImages = [];

            for (const image of uploadedImages) {
                const result = await client.query(
                    `INSERT INTO issue_images
                    (issue_id, image_url, public_id)
                    VALUES ($1, $2, $3)
                    RETURNING *`,
                    [
                        issueId,
                        image.secure_url,
                        image.public_id,
                    ]
                );

                savedImages.push(result.rows[0]);
            }

            // Update reportissues table with the first uploaded image URL
            if (uploadedImages.length > 0) {
                await client.query(
                    `UPDATE reportissues
         SET image_url = $1
         WHERE id = $2`,
                    [
                        uploadedImages[0].secure_url,
                        issueId,
                    ]
                );
            }

            await client.query("COMMIT");

            return res.status(201).json({
                success: true,
                message: "Images uploaded successfully",
                data: savedImages,
            });

        } catch (error) {
            await client.query("ROLLBACK");
            throw error;

        } finally {
            client.release();
        }

    } catch (error) {
        console.error("Issue image upload error:", error);

        // Cleanup uploaded Cloudinary images if DB operation fails
        await deleteCloudinaryImages(
        uploadedImages.map((image) => image.public_id)
        );

        return res.status(500).json({
            success: false,
            message: "Failed to upload issue images",
        });
    }
};