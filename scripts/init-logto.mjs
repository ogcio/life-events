#!/usr/bin/env bash
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
/**
 * Utility script to automatically create .env files based on .env.sample file
 *
 */

const IMAGE_MODES = {
  LOCAL: 'local',
  REMOTE: 'remote'
}

const LOGTO_PARENT_FOLDER_PATH = process.env.LOGTO_PARENT_FOLDER_PATH ?? undefined;
const LOGTO_FOLDER_NAME = process.env.LOGTO_FOLDER_NAME ?? 'logto';
const LOGTO_REPO_URL = process.env.LOGTO_REPO_URL ?? 'git@github.com:ogcio/logto.git';
const LOGTO_BRANCH_NAME = process.env.LOGTO_BRANCH_NAME ?? 'dev';
const LOGTO_IMAGE_MODE = process.env.LOGTO_IMAGE_MODE ?? IMAGE_MODES.LOCAL;

const initializeLogto = () => {
  if(LOGTO_IMAGE_MODE === IMAGE_MODES.REMOTE) {
    throw new Error('Remote image mode is not implemented yet');
  }

  return localImageMode();
}

const localImageMode = () => {
  const logtoFolderPath = cloneLogto();
  runLocalLogto(logtoFolderPath);
}

const cloneLogto = () => {
  const whereToClone = LOGTO_PARENT_FOLDER_PATH ?? path.dirname(process.cwd());
  const fullPath = path.join(whereToClone, LOGTO_FOLDER_NAME);

  if(fs.existsSync(fullPath)) {
    console.log('Logto repository already cloned');
    return fullPath;
  }

  console.log(`Cloning Logto repository into ${fullPath}`);

  execSync(`git clone --branch ${LOGTO_BRANCH_NAME} ${LOGTO_REPO_URL} ${LOGTO_FOLDER_NAME}`, {
    stdio: [0, 1, 2], // we need this so node will print the command output
    cwd: whereToClone
  });

  console.log('Logto repository cloned');

  return fullPath;
}

const runLocalLogto = (fullPath) => {
  console.log(`Building local Logto`);

  execSync(`make build run`, {
    stdio: [0, 1, 2], // we need this so node will print the command output
    cwd: fullPath
  });

  console.log('Local Logto ready');
}

initializeLogto();