import cors from "cors";
import express, { type Request, type Response, type NextFunction } from "express";
import { prisma } from "./lib/prisma";

const app = express();
const port = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.get("/api/db-health", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Database unreachable" });
  }
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
