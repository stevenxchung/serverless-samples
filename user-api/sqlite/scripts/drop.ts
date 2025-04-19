import db from "@db/config";

const dropUsersTable = () => {
  const stmt = db.prepare("DROP TABLE IF EXISTS users");
  stmt.run();
  console.log("Users table dropped successfully.\n");
  db.close();
};

dropUsersTable();
