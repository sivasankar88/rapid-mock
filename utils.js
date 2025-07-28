import inquirer from "inquirer";
import fs from "fs";
import { faker } from "@faker-js/faker";
const CONFIG_PATH = "./mockConfig.json";

const getConfig = () => {
  return fs.existsSync(CONFIG_PATH)
    ? JSON.parse(fs.readFileSync(CONFIG_PATH))
    : [];
};
const saveConfig = (config) => {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
};
export const addEndpoint = async () => {
  const config = getConfig();
  const answers = await inquirer.prompt([
    { name: "route", message: "Enter route (e.g., /users):" },
    {
      name: "method",
      type: "list",
      choices: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
    { name: "delay", message: "Delay in ms (optional):", default: 0 },
  ]);

  if (answers.method === "GET") {
    const { responseCount } = await inquirer.prompt({
      name: "responseCount",
      message: "Number of responses:",
    });
    const { fieldCount } = await inquirer.prompt({
      name: "fieldCount",
      message: "Number of fields:",
    });
    const schema = {};

    for (let i = 0; i < parseInt(fieldCount); i++) {
      const { key, type } = await inquirer.prompt([
        { name: "key", message: `Field ${i + 1} name:` },
        {
          name: "type",
          message: `Field ${i + 1} type:`,
          choices: ["string", "number", "boolean", "date"],
        },
      ]);
      schema[key] = type;
    }
    config.push({ ...answers, responseCount: parseInt(responseCount), schema });
  } else {
    const { message } = await inquirer.prompt({
      name: "message",
      message: "Static response message:",
    });
    config.push({ ...answers, message });
  }
  saveConfig(config);
  console.log("Endpoint added!");
};

export const listEndpoints = () => {};

export const deleteEndpoint = () => {};

export const fieldToFaker = (fieldName, fieldType) => {
  switch (fieldName) {
    case "name":
      return faker.person.firstName();
    case "email":
      return faker.internet.email();
    case "age":
      return faker.number.int();
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
