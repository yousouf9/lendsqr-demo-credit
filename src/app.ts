import "./container/di/container";
import express, { json, urlencoded } from "express";
import "express-async-errors";

import { Helmet } from "./startup/helmet";
import { Cors } from "./startup/cors";
import { currentUser } from "./middlewares/current-user";
import { NotFoundError } from "./errors";
import { errorHandler } from "./middlewares/error-handler";
import { userAuthRouter } from "./routes/auth";
import { tranRouter } from "./routes/transaction";

const app = express();

Helmet(app);
// RateLimiter(app);
Cors(app);

app.set("trust proxy", true);
app.use(json());
app.use(urlencoded({ extended: true }));

//set current user for needed authentication
app.use(currentUser);

app.use(userAuthRouter);
app.use(tranRouter);

app.use("*", (req, res) => {
  throw new NotFoundError("resource path not found");
});

app.use(errorHandler);

export { app };
