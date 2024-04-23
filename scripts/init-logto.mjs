#!/usr/bin/env bash
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

/**
 * Utility script to initialize Logto locally
 */

const IMAGE_MODES = {
  LOCAL: 'local',
  REMOTE: 'remote'
}

// Why using env variables instead of params?
// Because in this way each user can personalize its own scenario without
// having to update package.json
const LOGTO_PARENT_FOLDER_PATH = process.env.LOGTO_PARENT_FOLDER_PATH ?? undefined;
const LOGTO_FOLDER_NAME = process.env.LOGTO_FOLDER_NAME ?? 'logto';
const LOGTO_REPO_URL = process.env.LOGTO_REPO_URL ?? 'git@github.com:ogcio/logto.git';
const LOGTO_BRANCH_NAME = process.env.LOGTO_BRANCH_NAME ?? 'dev';
const LOGTO_IMAGE_MODE = process.env.LOGTO_IMAGE_MODE ?? IMAGE_MODES.LOCAL;
const LOGTO_PULL_BRANCH = Boolean(process.env.LOGTO_PULL_BRANCH ?? 'true');

const initializeLogto = () => {
  if(LOGTO_IMAGE_MODE === IMAGE_MODES.REMOTE) {
    throw new Error('Remote image mode is not implemented yet');
  }

  return localImageMode();
}

const localImageMode = () => {
  const logtoFolderPath = cloneLogto();
  pullLocalLogto(logtoFolderPath);
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

const pullLocalLogto = (fullPath) => {
  if(!LOGTO_PULL_BRANCH) {
    return;
  }

  console.log(`Pulling local Logto`);

  execSync(`git checkout ${LOGTO_BRANCH_NAME} && git pull`, {
    stdio: [0, 1, 2],
    cwd: fullPath
  });

  console.log('Local Logto updated');
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