import { Hono } from "hono";
import type { AppEnv } from "../../type";
import { createFrontUser } from "./create/controller/create-front-user.controller";
import { updateFrontUser } from "./update/controller/update-front-user.controller";
import { deleteFrontUser } from "./delete/controller/delete-front-user.controller";


const frontuser = new Hono<AppEnv>();

// ルーティング
frontuser.route("/", createFrontUser);
frontuser.route("/", updateFrontUser);
frontuser.route("/", deleteFrontUser);

export { frontuser };
