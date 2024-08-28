import { exec } from "child_process";
import fs from "fs";
import { SAFE_PID_FILENAME } from "./constants";
import path from "path";
import os from "os";

const SAFE_DIRECTORY = os.tmpdir();

const PID_FILE = path.join(SAFE_DIRECTORY, SAFE_PID_FILENAME);

function writeFile(filename, content) {
  switch (filename) {
    case SAFE_PID_FILENAME:
      fs.writeFileSync(SAFE_PID_FILENAME, content, {
        flag: "w",
        encoding: "utf8",
      });
      break;
  }
}

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
      try {
        if (path.dirname(PID_FILE) === SAFE_DIRECTORY) {
          writeFile(PID_FILE, ngrokProcess.pid.toString());
          console.log(`ngrok PID saved to ${PID_FILE}`);
          resolve();
        } else {
          throw new Error("Invalid file path detected");
        }
      } catch (error) {
        console.error(`Failed to write PID file: ${error.message}`);
        reject(error);
      }
    });
  });
};
