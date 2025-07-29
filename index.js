#!/usr/bin/env node
import inquirer from "inquirer";
import { startServer } from "./server.js";
import { addEndpoint, listEndpoints, deleteEndpoint } from "./utils.js";

let serverStarted = false;

const main = async () => {
  const actions = ["Add Endpoint", "List Endpoint", "Delete Endpoint", "Exit"];

  while (true) {
    const { action } = await inquirer.prompt({
      type: "list",
      name: "action",
      message: "Choose an action:",
      choices: serverStarted ? actions : ["Start Server", ...actions],
    });

    if (action === "Start Server") {
      if (!serverStarted) {
        startServer();
        serverStarted = true;
        await new Promise((resolve) => setTimeout(resolve, 300));
      } else {
        console.log("Server already running.");
      }
    } else if (action === "Add Endpoint") {
      await addEndpoint();
    } else if (action === "List Endpoint") {
      await listEndpoints();
    } else if (action === "Delete Endpoint") {
      await deleteEndpoint();
    } else if (action === "Exit") {
      console.log("👋 Exiting...");
      process.exit(0);
    }
  }
};

main();
