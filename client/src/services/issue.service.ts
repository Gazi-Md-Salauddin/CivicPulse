import { api, apiUrl, parseApiResponse } from "./api";
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
export const getIssues = async (): Promise<IGetIssuesResponse> => {
  const response = await fetch(apiUrl("issue"), {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return parseApiResponse<IGetIssuesResponse>(response);
};


// Get all citizen issue
export const getAllPublicIssues = async (): Promise<IGetIssuesResponse> => {
  const response = await fetch(apiUrl("public/issues"), {
    method: "GET",
    cache: "no-store",
  });

  return parseApiResponse<IGetIssuesResponse>(response);
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
  const response = await fetch(apiUrl(`public/issues/${id}`), {
    method: "GET",
    cache: "no-store",
  });

  return parseApiResponse<IPublicIssueDetailsResponse>(response);
};