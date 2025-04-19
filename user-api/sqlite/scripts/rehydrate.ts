import { faker } from "@faker-js/faker";
import db from "@db/config";

const generateRandomUser = () => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email(),
  address: faker.location.streetAddress(),
  phone: faker.phone.number(),
  isActive: faker.datatype.boolean() ? 1 : 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const insertRandomUsers = (numUsers: number) => {
  const stmt = db.prepare(`
    INSERT INTO users 
    (firstName, lastName, email, address, phone, isActive, createdAt, updatedAt) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.transaction(() => {
    console.log(`Creating new users...`);
    for (let i = 0; i < numUsers; i++) {
      const user = generateRandomUser();
      console.log(user);
      stmt.run(
        user.firstName,
        user.lastName,
        user.email,
        user.address,
        user.phone,
        user.isActive,
        user.createdAt,
        user.updatedAt
      );
    }
  })();

  console.log(`${numUsers} users inserted`);
  db.close();
};

// Adjust the number of users as needed
insertRandomUsers(25);
