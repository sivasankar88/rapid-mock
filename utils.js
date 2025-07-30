import inquirer from "inquirer";
import fs from "fs";
import { faker } from "@faker-js/faker";
import { reloadEndpoints } from "./server.js";

const CONFIG_PATH = "./mockConfig.json";

const getConfig = () => {
  return fs.existsSync(CONFIG_PATH)
    ? JSON.parse(fs.readFileSync(CONFIG_PATH))
    : [];
};

const saveConfig = (config) => {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  reloadEndpoints();
};

export const addEndpoint = async () => {
  const config = getConfig();
  const answers = await inquirer.prompt([
    {
      name: "route",
      message: "Enter route (e.g., /users):",
      validate: (input) =>
        input.startsWith("/") ? true : "Route must start with '/'",
    },
    {
      name: "method",
      message: "method",
      type: "list",
      choices: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
    {
      name: "delay",
      message: "Delay in ms (optional):",
      default: 0,
      validate: (input) =>
        isNaN(parseInt(input)) ? "Please enter a valid number" : true,
    },
    {
      name: "code",
      message: "status code:",
      default: 200,
      validate: (input) => {
        const code = parseInt(input);
        if (isNaN(code)) return "Please enter a valid number";
        if (code < 100 || code > 599) return "Please enter a valid status code";
        return true;
      },
    },
  ]);

  if (answers.code == 200 && answers.method === "GET") {
    const { responseCount } = await inquirer.prompt({
      name: "responseCount",
      message: "Number of responses:",
      default: 5,
      validate: (input) =>
        isNaN(parseInt(input)) ? "Please enter a valid number" : true,
    });
    const { fieldCount } = await inquirer.prompt({
      name: "fieldCount",
      message: "Number of fields:",
      default: 1,
      validate: (input) =>
        isNaN(parseInt(input)) ? "Please enter a valid number" : true,
    });

    const schema = {};
    for (let i = 0; i < parseInt(fieldCount); i++) {
      const { key, type } = await inquirer.prompt([
        {
          name: "key",
          message: `Field ${i + 1} name:`,
          validate: (input) =>
            !input.length ? "Please enter a valid field name" : true,
        },
        {
          name: "type",
          type: "list",
          message: `Field ${i + 1} type:`,
          choices: ["string", "number", "boolean", "date"],
        },
      ]);
      schema[key] = type;
    }

    config.push({
      ...answers,
      code: parseInt(answers.code),
      responseCount: parseInt(responseCount),
      schema,
    });
  } else {
    const { message } = await inquirer.prompt({
      name: "message",
      message: "Static response message:",
    });
    config.push({ ...answers, code: parseInt(answers.code), message });
  }

  saveConfig(config);
  console.log("✅ Endpoint added and applied live");
};

export const listEndpoints = () => {
  const config = getConfig();
  if (!config.length) return console.log("No endpoints found");
  config.forEach((endpoint, index) => {
    console.log(`${index + 1}. [${endpoint.method}] ${endpoint.route}`);
  });
};

export const deleteEndpoint = async () => {
  const config = getConfig();
  if (!config.length) return console.log("No endpoints found");

  const { index } = await inquirer.prompt({
    type: "list",
    name: "index",
    message: "Choose endpoint to delete:",
    choices: config.map((endpoint, index) => ({
      name: `[${endpoint.method}] ${endpoint.route}`,
      value: index,
    })),
  });

  config.splice(index, 1);
  saveConfig(config);
  console.log("🗑️  Endpoint deleted and changes applied live");
};

export const fieldToFaker = (fieldName, fieldType) => {
  switch (fieldName) {
    case "name":
      return faker.person.firstName();
    case "email":
      return faker.internet.email();
    case "age":
      return faker.number.int({ min: 0, max: 100 });
    case "id":
      return faker.datatype.uuid();
    case "city":
      return faker.location.city();
    case "country":
      return faker.location.country();
    case "phone":
      return faker.phone.number();
    case "date":
      return faker.date.recent().toISOString();
  }
  switch (fieldType) {
    case "string":
      return faker.lorem.word();
    case "number":
      return faker.datatype.number();
    case "boolean":
      return faker.datatype.boolean();
    case "date":
      return faker.date.recent().toISOString();
    default:
      return null;
  }
};
