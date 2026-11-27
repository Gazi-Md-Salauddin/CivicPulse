
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

// Get citizen own issues
export const getIssues = async (): Promise<IGetIssuesResponse> => {
  return api.get<IGetIssuesResponse>("/issue");
};

// Get all public issues
export const getAllPublicIssues = async (): Promise<IGetIssuesResponse> => {
  const response = await fetch(apiUrl("public/issues"), {
    method: "GET",
    cache: "no-store",
  });

  return parseApiResponse<IGetIssuesResponse>(response);
};

// Public issue details
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
