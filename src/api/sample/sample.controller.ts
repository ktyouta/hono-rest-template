import { Hono } from "hono";
import type { AppEnv } from "../../type";
import { getListSample } from "./get-list/controller/get-list-sample.controller";
import { getSampleById } from "./get/controller/get-sample.controller";
import { createSample } from "./create/controller/create-sample.controller";
import { updateSample } from "./update/controller/update-sample.controller";
import { deleteSample } from "./delete/controller/delete-sample.controller";

const sample = new Hono<AppEnv>();

// ルーティング
sample.route("/", getListSample);
sample.route("/", getSampleById);
sample.route("/", createSample);
sample.route("/", updateSample);
sample.route("/", deleteSample);

export { sample };
