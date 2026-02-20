import express from "express";
import cors from "cors";
import helmet from "helmet";
import router from "./interfaces/routes/index.js";

const app = express();

app.use(cors({ origin: ["http://localhost:5173"] }));
app.use(helmet());
app.use(express.json());

app.use("/", router);

app.listen(5000, () => {
  console.log("Listening at http://localhost:5000");
});
