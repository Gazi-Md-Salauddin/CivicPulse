import express, { type Express, type Request, type Response } from 'express';

import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

const app: Express = express();

app.use(
  cors({
    origin: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// BetterAuth route
app.all("/api/*splat", toNodeHandler(auth));

app.use(express.json());


app.get("/", (req: Request, res: Response) => {
    res.send("Hello world")
})


export default app;