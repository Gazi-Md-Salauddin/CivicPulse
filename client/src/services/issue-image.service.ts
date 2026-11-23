export const uploadIssueImages = async (
    issueId: string,
    images: File[]
) => {
    const formData = new FormData();

    images.forEach((image) => {
        formData.append("images", image);
    });

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/issues/${issueId}/images`,
        {
            method: "POST",
            credentials: "include",
            body: formData,
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Image upload failed");
    }

    return result;
};