"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadIssueImages } from "@/services/issue-image.service";

interface IssueImageUploadProps {
    issueId: string;
}

export default function IssueImageUpload({
    issueId,
}: IssueImageUploadProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);

    const handleUpload = async () => {
        if (!files.length) return;

        try {
            setLoading(true);

            const result = await uploadIssueImages(issueId, files);

            setUploadedImages((prev) => [
                ...prev,
                ...result.data.map(
                    (image: { image_url: string }) => image.image_url
                ),
            ]);

            setFiles([]);

            alert("Images uploaded successfully!");

        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : "Image upload failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-5">

            <div>
                <label className="mb-2 block font-medium">
                    Upload Issue Images
                </label>

                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(e) => {
                        const selected = Array.from(
                            e.target.files || []
                        );

                        setFiles(selected.slice(0, 5));
                    }}
                />

                <p className="mt-2 text-sm text-gray-500">
                    Maximum 5 images, 5 MB each.
                </p>
            </div>

            {files.length > 0 && (
                <div className="flex flex-wrap gap-3">
                    {files.map((file, index) => (
                        <div
                            key={`${file.name}-${index}`}
                            className="relative h-24 w-24 overflow-hidden rounded-lg"
                        >
                            <Image
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                fill
                                unoptimized
                                className="object-cover"
                            />
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={loading || files.length === 0}
                className="rounded-lg bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
            >
                {loading ? "Uploading..." : "Upload Images"}
            </button>

            {uploadedImages.length > 0 && (
                <div className="space-y-2">
                    <h3 className="font-semibold">
                        Uploaded Images
                    </h3>

                    <div className="flex flex-wrap gap-3">
                        {uploadedImages.map((url, index) => (
                            <div
                                key={`${url}-${index}`}
                                className="relative h-24 w-24 overflow-hidden rounded-lg"
                            >
                                <Image
                                    src={url}
                                    alt={`Uploaded ${index + 1}`}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}