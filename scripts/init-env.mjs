#!/usr/bin/env bash
import fs from "fs";
import path from "path";

/**
 * Utility script to automatically create .env files based on .env.sample file
 *
 */

function copyEnvFiles(paths) {
  for (const currentPath of paths) {
    if (fs.existsSync(path.join(currentPath, ".env.sample"))) {
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

const paths = [
  ...fs
    .readdirSync(path.join(process.cwd(), "apps"))
    .map((p) => path.join(process.cwd(), "apps", p)),
  ...fs
    .readdirSync(path.join(process.cwd(), "packages"))
    .map((p) => path.join(process.cwd(), "packages", p)),
];

copyEnvFiles(paths);
