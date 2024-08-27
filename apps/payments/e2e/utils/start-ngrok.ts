import { exec } from "child_process";
import fs from "fs";
import { PID_FILE_PATH } from "./constants";
import path from "path";
import os from "os";

const SAFE_DIRECTORY = os.tmpdir(); // You can customize this as needed
const PID_FILE = path.resolve(SAFE_DIRECTORY, PID_FILE_PATH);

export const startNgrok = () => {
  return new Promise((resolve, reject) => {
    const domain = process.env.NGROK_DOMAIN;

    if (!domain) {
      console.error("Error: NGROK_DOMAIN environment variable is not set.");
      process.exit(1);
    }

    const command = `ngrok http 8001 --domain ${domain}`;
    console.log(`Running command: ${command}`);

    const ngrokProcess = exec(command);

    ngrokProcess.stdout.on("data", (data) => {
      console.log(`ngrok stdout: ${data}`);
    });

    ngrokProcess.stderr.on("data", (data) => {
      console.error(`ngrok stderr: ${data}`);
    });

    ngrokProcess.on("error", (error) => {
      console.error(`Failed to start ngrok: ${error.message}`);
      reject(error);
    });

    ngrokProcess.on("spawn", () => {
      fs.writeFileSync(PID_FILE, ngrokProcess.pid.toString());
      resolve();
    });
  });
};
