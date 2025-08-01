import helmet from "helmet";
import { Application } from "express";

export const Helmet = (app: Application) => {
  app.use(
    helmet({
      strictTransportSecurity: {
        maxAge: 15552000,
        includeSubDomains: true,
        preload: true,
      },
    })
  );
};
