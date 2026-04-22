import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { backfillProductImages, removeStaleMediaRecords } from "./seed";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/media/file", (_req, res) => {
  res.status(410).json({ error: "Media files have been migrated to permanent storage. Re-upload images to get updated URLs." });
});

app.use("/api", router);

removeStaleMediaRecords().catch((err) => {
  logger.warn({ err }, "Stale media cleanup failed — non-fatal");
});

backfillProductImages().catch((err) => {
  logger.warn({ err }, "Product image backfill failed — non-fatal");
});

export default app;
