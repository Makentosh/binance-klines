import mysql from 'mysql';

const db = mysql.createConnection({
    // host: 'localhost', // Use the service name defined in Docker Compose (if applicable)
    port: parseInt(process.env.MYSQLDB_DOCKER_PORT),
    host: process.env.MYSQL_CONTAINER_NAME,
    user: process.env.MYSQLDB_USER,
    password: process.env.MYSQLDB_MYSQL_PASSWORD,
    database: process.env.MYSQLDB_DATABASE

});

export default db;
