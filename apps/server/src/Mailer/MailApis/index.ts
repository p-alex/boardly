import getTestMailApi from "./getTestMailApi.js";

export interface MailApi {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export { getTestMailApi };
