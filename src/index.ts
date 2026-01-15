import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AppEnv } from "./type";
import {
  envInitMiddleware,
  requestIdMiddleware,
  accessLogMiddleware,
  errorHandler,
  notFoundHandler,
} from "./middleware";
import { health, sample, frontuser, frontuserlogin, refresh } from "./api";

const app = new Hono<AppEnv>();

// ミドルウェア設定
app.use("*", envInitMiddleware);
app.use("*", cors());
app.use("*", requestIdMiddleware);
app.use("*", accessLogMiddleware);

// エラーハンドラー
app.onError(errorHandler);
app.notFound(notFoundHandler);

// ルーティング
app.route("/", health);
app.route("/", sample);
app.route("/", frontuser);
app.route("/", frontuserlogin);
app.route("/", refresh);

export default app;
