export interface Track {
  id: string;
  title: string;
  url: string;
  filename: string;
  uploadDate: string;
}

export interface UploadResponse {
  url: string;
  filename: string;
  mock?: boolean;
}
