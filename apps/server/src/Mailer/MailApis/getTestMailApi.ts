import { MailApi } from "./index.js";

const getTestMailApi = (user: string, pass: string): MailApi => {
  return {
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user,
      pass,
    },
  };
};

export default getTestMailApi;
