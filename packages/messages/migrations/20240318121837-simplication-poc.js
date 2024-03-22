"use strict";

var dbm;
var type;
var seed;
var fs = require("fs");
var path = require("path");
var Promise;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
  Promise = options.Promise;
};

exports.up = function (db) {
  var filePath = path.join(
    __dirname,
    "sqls",
    "20240318121837-simplication-poc-up.sql",
  );
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, { encoding: "utf-8" }, function (err, data) {
      if (err) return reject(err);
      console.log(filePath);
      console.log("received data: " + data);

      resolve(data);
    });
  }).then(function (data) {
    return db.runSql(data);
  });
  // db.runSql(`
  // DROP TABLE notifications;
  // DROP TABLE messages;

  // CREATE TABLE IF NOT EXISTS form_errors(
  //   user_id UUID NOT NULL,
  //   state_id UUID NOT NULL, -- eg. email send form
  //   field TEXT NOT NULL,
  //   error_value TEXT,
  //   error_message TEXT NOT NULL
  // );

  // CREATE TABLE IF NOT EXISTS message_states(
  //   state_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  //   user_id UUID NOT NULL,
  //   state JSONB
  // );

  // CREATE TABLE IF NOT EXISTS messages (
  //   message_id uuid default gen_random_uuid(),
  //   for_email text not null,
  //   subject text not null,
  //   abstract text,
  //   content text,
  //   action_url text,
  //   is_unseen boolean default true,
  //   created_at timestamptz default now()
  // );

  // create table message_interpolation_accessors(
  //   message_id uuid not null,
  //   value_accessor text not null,
  //   key_accessor text not null
  // );

  // `);
};

exports.down = function (db) {
  db.runSql(`
    DROP TABLE form_errors;
    DROP TABLE events;
    DROP TABLE email_message_states;
  `);
};

exports._meta = {
  version: 2,
};
