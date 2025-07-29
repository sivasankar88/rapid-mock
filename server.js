import express from "express";
import fs from "fs";
import { fieldToFaker } from "./utils.js";

const app = express();
app.use(express.json());

const CONFIG_PATH = "./mockConfig.json";
let dynamicRouter = express.Router();
app.use(dynamicRouter);

const loadConfig = () => {
  return fs.existsSync(CONFIG_PATH)
    ? JSON.parse(fs.readFileSync(CONFIG_PATH))
    : [];
};

export const reloadEndpoints = () => {
  dynamicRouter.stack = [];
  const config = loadConfig();

  config.forEach((endpoint) => {
    const method = endpoint.method.toLowerCase();
    dynamicRouter[method](endpoint.route, (req, res) => {
      if (method === "get" && endpoint.code == 200) {
        const response = [];
        for (let i = 0; i < endpoint.responseCount; i++) {
          const obj = {};
          for (let field in endpoint.schema) {
            obj[field] = fieldToFaker(field, endpoint.schema[field]);
          }
          response.push(obj);
        }
        setTimeout(
          () => res.status(endpoint.code).json(response),
          endpoint.delay || 0
        );
      } else {
        setTimeout(
          () => res.status(endpoint.code).json({ message: endpoint.message }),
          endpoint.delay || 0
        );
      }
    });
  });
  console.log("✅ Endpoints reloaded");
};

export const startServer = () => {
  reloadEndpoints();
  const PORT = 3000;
  app.listen(PORT, () =>
    console.log(`\n🚀 Rapid Mock server running on http://localhost:${PORT}`)
  );
};
