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
