import express from "express";
import cors from "cors";
import helmet from "helmet";
import router from "./interfaces/routes/index.js";
import { env } from "./config.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());
app.use(cors({ origin: [env.CLIENT_BASE_URL], credentials: true }));
app.use(helmet());
app.use(express.json());

app.use("/", router);

app.listen(5000, () => {
  console.log("Listening at http://localhost:5000");
});
