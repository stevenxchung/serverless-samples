# User API

A simple User API using REST to perform CRUD operations on user data with an SQLite database.

## Initial Setup

Before running the app:

```bash
# Install all dependencies
npm i

# Optionally load in some mock data (will drop and create a new db)
npm run db:reload
```

There is an option to add an `.env` file to support various base urls and ports:

```
BASE_URL=
PORT=
```

Alternatively, if using [bun](https://bun.sh/) (recommended), replace `npm` with `bun`. The versions we recommend are:

```
  "engines": {
    "node": "22.x",
    "bun": "1.2.x"
  }
```

## Running the Application

The command below will start the server http://localhost:3000 or a configured `<BASE_URL>:<PORT>` as mentioned previously.

```bash
npm run dev
```

## Example REST Calls

1. **GET `/users`:** Get N users (defaults to 10)

   ```bash
   curl --location 'http://localhost:3000/users?limit=5'
   ```

2. **GET `/user/:id`:** Fetches a user by their unique ID

   ```bash
   curl --location 'http://localhost:3000/user/1'
   ```

3. **POST `/user`:** Creates a new user

   ```bash
    curl --location 'http://localhost:3000/user/' \
    --header 'Content-Type: application/json' \
    --data-raw '{
        "firstName": "Foo",
        "lastName": "Bar",
        "email": "foo.bar@gmail.com",
        "phone": "111-111-1111"
    }'
   ```

4. **PATCH `/user/:id`:** Updates user information

   ```bash
   curl --location --request PATCH 'http://localhost:3000/user/1' \
   --header 'Content-Type: application/json' \
   --data '{
   "phone": "111-222-3333"
   }'
   ```

5. **PATCH `/user/:id/status`:** Activates a user

   ```bash
   curl --location --request PATCH 'http://localhost:3000/user/1/status'
   ```

6. **DELETE /user/:id:** Deletes a user

   ```bash
   curl --location --request DELETE 'http://localhost:3000/user/1'
   ```
