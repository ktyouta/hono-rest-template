import { Hono } from "hono";
import { cors } from "hono/cors";
import { frontUser, frontUserLogin, health, refresh, sample } from "./api";
import { auth } from "./api/auth/controller";
import { envConfig } from "./config";
import {
  accessLogMiddleware,
  envInitMiddleware,
  errorHandler,
  notFoundHandler,
  requestIdMiddleware,
} from "./middleware";
import type { AppEnv } from "./type";

const app = new Hono<AppEnv>();

// ミドルウェア設定
app.use("*", envInitMiddleware);
app.use(
  '*',
  cors({
    origin: envConfig.corsOrigin,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-CSRF-Token',
    ],
  })
);
app.use("*", requestIdMiddleware);
app.use("*", accessLogMiddleware);

// エラーハンドラー
app.onError(errorHandler);
app.notFound(notFoundHandler);

// ルーティング
app.route("/", health);
app.route("/", sample);
app.route("/", frontUser);
app.route("/", frontUserLogin);
app.route("/", refresh);
app.route("/", auth)

export default app;
