import { Hono } from "hono";
import type { AppEnv } from "../../type";
import { createFrontUser } from "./create/controller/create-front-user.controller";
import { updateFrontUser } from "./update/controller/update-front-user.controller";
import { deleteFrontUser } from "./delete/controller/delete-front-user.controller";


const frontUser = new Hono<AppEnv>();

// ルーティング
frontUser.route("/", createFrontUser);
frontUser.route("/", updateFrontUser);
frontUser.route("/", deleteFrontUser);

export { frontUser };
