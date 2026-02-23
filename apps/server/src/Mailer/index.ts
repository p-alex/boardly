import { env } from "../config.js";
import getTestMailApi from "./MailApis/getTestMailApi.js";
import Mailer from "./Mailer.js";

const testMailer = new Mailer(
  getTestMailApi(env.EMAIL_API.USER, env.EMAIL_API.PASS),
  env.EMAIL_API.SENDER,
);

const mailer = env.NODE_ENV === "development" ? testMailer : testMailer;

export { mailer };
