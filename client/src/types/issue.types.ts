
export interface ICreateIssue {
  title: string;
  description: string;
  category:
    | "road_damage"
    | "streetlight"
    | "drainage"
    | "footpath"
    | "waste_management"
    | "public_infrastructure";
  location_address: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
}

export interface IIssueResponse {
  success: boolean;
  message: string;
  data: IIssue;
}




export interface IIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  location_address: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
  reporter_id: string;
  created_at: string;
  updated_at: string;
}

export interface IGetIssuesResponse {
  success: boolean;
  message: string;
  data: IIssue[];
}