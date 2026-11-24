import { api } from "./api";
import type {
  ICreateIssue,
  IIssueResponse,
  IGetIssuesResponse,
  IIssue,
} from "../types/issue.types";

// Create citizen issue
export const createIssue = async (
  issueData: ICreateIssue
): Promise<IIssueResponse> => {
  return api.post<IIssueResponse>("/issue", issueData);
};


// Get citizen own issue
export const getIssues = async (): Promise<IIssueResponse> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/issue`, {
    method: "GET",
    credentials: "include",
    headers: {
        "Content-Type": "application/json",
      },
  });

  const result = await response.json();

  console.log(response)

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch issues");
  }

  return result;
};


// Get all citizen issue
export const getAllPublicIssues = async (): Promise<IGetIssuesResponse> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/public/issues`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch public issues");
  }

  return result;
};


// Get issue by id
export interface IPublicIssueDetailsResponse {
  success: boolean;
  message: string;
  data: IIssue;
}

export const getPublicIssueById = async (
  id: string
): Promise<IPublicIssueDetailsResponse> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/public/issues/${id}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch issue details");
  }

  return result;
};