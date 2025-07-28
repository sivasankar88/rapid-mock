import inquirer from "inquirer";
import { startServer } from "./server.js";
import { addEndpoint, listEndpoints, deleteEndpoint } from "./utils.js";

(async () => {
  const actions = [
    "Start Server",
    "Add Endpoint",
    "List Endpoint",
    "Delete Endpoint",
  ];

  const { action } = await inquirer.prompt({
    type: "list",
    name: "action",
    message: "Choose an action:",
    choices: actions,
  });

  if (action === "Add Endpoint") await addEndpoint();
  else if (action === "Start Server") await startServer();
  else if (action === "List Endpoint") await listEndpoints();
  else if (action === "Delete Endpoint") await deleteEndpoint();
})();
