
const sqlite = ({
  env
}) => ({
  "defaultConnection": "default",
  "connections": {
    "default": {
      "connector": "bookshelf",
      "settings": {
        "client": "sqlite",
        "filename": ".tmp/test.db"
      },
      "options": {
        "useNullAsDefault": true
      }
    }
  }
});

const postgres = ({
  env
}) => ({
  "defaultConnection": "default",
  "connections": {
    "default": {
      "connector": "bookshelf",
      "settings": {
        "client": "postgres",
        "host": env('DB_HOST'),
        "port": env('DB_PORT'),
        "username": env('DB_USERNAME'),
        "password": env('DB_PASSWORD'),
        "database": env('DB_NAME'),
        "schema": "public"
      },
      "options": {
        "useNullAsDefault": true
      }
    }
  }
});
module.exports = sqlite;
// module.exports = postgres;
