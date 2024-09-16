import { promises as fs } from "fs";
import path from "path";

export default async () => {
  try {
    // Resolve the path to package.json
    const packageJsonPath = path.resolve("package.json");

    // Read the file content as a string
    const data = await fs.readFile(packageJsonPath, "utf-8");

    // Parse the JSON content
    const packageJson = JSON.parse(data);

    // Log or return the parsed content
    return packageJson.version;
  } catch (err) {
    console.error("Error reading package.json:", err);
  }
};
