import fs from "fs";
import { exec } from "child_process";
import { SAFE_PID_FILENAME } from "./constants";

export const stopNgrok = () => {
  if (fs.existsSync(SAFE_PID_FILENAME)) {
    const pid = fs.readFileSync(SAFE_PID_FILENAME, "utf8");

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

      fs.unlinkSync(SAFE_PID_FILENAME);
    });
  } else {
    console.log("No ngrok PID file found. ngrok might not be running.");
  }
};
