#!/usr/bin/env bash
import fs, { readdirSync } from "fs";
import path from "path";

/**
 * Utility script to automatically create .env files based on .env.sample file
 *
 */

const updateMode = process.env.MODE === "update";

function copyEnvFiles(paths) {
  for (const currentPath of paths) {
    if (fs.existsSync(path.join(currentPath, ".env.sample"))) {
      if (updateMode) {
        fs.copyFileSync(
          path.join(currentPath, ".env.sample"),
          path.join(currentPath, ".env"),
        );
        console.log(`.env file created in ${currentPath}`);
      } else {
        if (fs.existsSync(path.join(currentPath, ".env"))) {
          console.log(`${currentPath} already has .env file, ignoring...`);
        } else {
          fs.copyFileSync(
            path.join(currentPath, ".env.sample"),
            path.join(currentPath, ".env"),
          );
          console.log(`.env file created in ${currentPath}`);
        }
      }
    }
  }
}

const paths = [
  ...fs
    .readdirSync(path.join(process.cwd(), "apps"))
    .flatMap((p) => {
      const subPath = path.join(process.cwd(), "apps", p)
      if (fs.existsSync(path.join(subPath, 'db'))) {
        return [path.join(process.cwd(), "apps", p), path.join(subPath, 'db')]
      }
      return path.join(process.cwd(), "apps", p)
    }),
  ...fs
    .readdirSync(path.join(process.cwd(), "packages"))
    .flatMap((p) => path.join(process.cwd(), "packages", p)),
  process.cwd(),
];

copyEnvFiles(paths);
