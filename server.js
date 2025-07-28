import express from "express";
import fs from "fs";
import { fieldToFaker } from "./utils.js";
const app = express();
app.use(express.json());
const CONFIG_PATH = "./mockConfig.json";
let config = fs.existsSync(CONFIG_PATH)
  ? JSON.parse(fs.readFileSync(CONFIG_PATH))
  : [];

config.forEach((endpoint) => {
  const method = endpoint.method.toLowerCase();
  app[method](endpoint.route, (req, res) => {
    if (method === "get") {
      const response = [];
      for (let i = 0; i < endpoint.responseCount; i++) {
        const obj = {};
        for (let field in endpoint.schema) {
          obj[field] = fieldToFaker(field, endpoint.schema[field]);
        }
        response.push(obj);
      }
      setTimeout(() => res.json(response), endpoint.delay || 0);
    } else {
      setTimeout(
        () => res.json({ message: endpoint.message }),
        endpoint.delay || 0
      );
    }
  });
});

const PORT = 3000;
export const startServer = () => {
  app.listen(PORT, () =>
    console.log("Rapid Mock server running on http://localhost:" + PORT)
  );
};
