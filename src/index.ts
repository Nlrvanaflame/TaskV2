import express, { Express, Request, Response } from "express";
import routes from "./routes";
import loggingMiddleware from "./middleware/logging.middleware";


const app: Express = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

app.use(loggingMiddleware);
app.use("/", routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});