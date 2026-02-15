import cors from "cors";
import express from "express";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import simulationRoutes from "./api/simulationRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();
  const frontendDist = resolve(
    process.cwd(),
    process.env.FRONTEND_DIST ?? "app/frontend/dist",
  );
  const indexHtml = resolve(frontendDist, "index.html");

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api", simulationRoutes);

  if (existsSync(indexHtml)) {
    app.use(express.static(frontendDist));
    app.get(/^\/(?!api).*/, (_req, res) => {
      res.sendFile(indexHtml);
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

if (process.env.NODE_ENV !== "test") {
  const port = Number(process.env.PORT ?? 4300);
  const app = createApp();
  app.listen(port, () => {
    console.log(`Backend server listening on http://localhost:${port}`);
  });
}
