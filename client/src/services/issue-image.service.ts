import { apiUrl, parseApiResponse } from "./api";

export type UploadedIssueImage = {
    image_url: string;
    public_id: string;
};

export type UploadIssueImagesResponse = {
    success: boolean;
    message: string;
    data: UploadedIssueImage[];
};

export const uploadIssueImages = async (
    issueId: string,
    images: File[]
): Promise<UploadIssueImagesResponse> => {
    const formData = new FormData();

    images.forEach((image) => {
        formData.append("images", image);
    });

    const response = await fetch(apiUrl(`issues/${issueId}/images`), {
        method: "POST",
        credentials: "include",
        body: formData,
    });

    return parseApiResponse<UploadIssueImagesResponse>(response);
};