import cors from "cors";
import { Application } from "express";

const allowedOrigins = [
  "https://yusuf-ibrahim-lendsqr-be-test.onrender.com",
  "http://localhost:4000",
];

const corsOptions: cors.CorsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
};

export const Cors = (app: Application) => {
  app.use(cors(corsOptions));
};
