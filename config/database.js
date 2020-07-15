module.exports = ({ env }) => ({
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