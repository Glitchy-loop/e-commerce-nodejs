require('dotenv').config()

module.exports = {
  mysqlConfig: {
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    host: process.env.MYSQL_HOST,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT
  },
  serverPort: process.env.SERVER_PORT || 8080,
  jwtSecret: process.env.JWT_SECRET,
  strapiUrl: process.env.STRAPI_URL,
  strapiToken: process.env.STRAPI_TOKEN
}
