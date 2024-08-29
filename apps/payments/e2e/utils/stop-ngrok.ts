import fs from "fs";
import { exec } from "child_process";
import { SAFE_PID_FILENAME } from "./constants";

const readFile = (filename) => {
  switch (filename) {
    case "ngrok.pid":
      fs.readFileSync("ngrok.pid", "utf8");
      break;
  }
};

const checkFileExists = (filename) => {
  switch (filename) {
    case "ngrok.pid":
      return fs.existsSync("ngrok.pid");
    default:
      return false;
  }
};

const unlinkFile = (filename) => {
  switch (filename) {
    case "ngrok.pid":
      fs.unlinkSync("ngrok.pid");
      break;
  }
};

export const stopNgrok = () => {
  if (checkFileExists(SAFE_PID_FILENAME)) {
    const pid = readFile(SAFE_PID_FILENAME);

    exec(`kill ${pid}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error stopping ngrok: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      console.log(`ngrok stopped successfully.`);

      unlinkFile(SAFE_PID_FILENAME);
    });
  } else {
    console.log("No ngrok PID file found. ngrok might not be running.");
  }
};
