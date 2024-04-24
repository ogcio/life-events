#!/usr/bin/env bash
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Why using env variables instead of params?
// Because in this way each user can personalize its own scenario without
// having to update package.json
const LOGTO_PARENT_FOLDER_PATH =
  process.env.LOGTO_PARENT_FOLDER_PATH ?? undefined;
const LOGTO_FOLDER_NAME = process.env.LOGTO_FOLDER_NAME ?? "logto";

const stopLogto = () => {
  const whereToClone = LOGTO_PARENT_FOLDER_PATH ?? path.dirname(process.cwd());
  const fullPath = path.join(whereToClone, LOGTO_FOLDER_NAME);
  console.log(`Stopping local Logto`);

  if (!fs.existsSync(fullPath)) {
    console.log("Logto repository not found");
    return fullPath;
  }

  execSync(`make down`, {
    stdio: [0, 1, 2], // we need this so node will print the command output
    cwd: fullPath,
  });

  console.log("Local Logto stopped");
};

stopLogto();
