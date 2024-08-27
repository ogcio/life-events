import fs from "fs";
import { exec } from "child_process";
import { PID_FILE_PATH } from "./constants";

export const stopNgrok = () => {
  if (fs.existsSync(PID_FILE_PATH)) {
    const pid = fs.readFileSync(PID_FILE_PATH, "utf8");

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

      fs.unlinkSync(PID_FILE_PATH);
    });
  } else {
    console.log("No ngrok PID file found. ngrok might not be running.");
  }
};
