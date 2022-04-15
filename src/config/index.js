const fs = require("fs");
const path = require("path");

// 端口号
const DB_PORT = 27017;
// 主机名
const DB_HOST = "localhost";
// 数据库名
const DB_NAME = "music";
// 数据库用户名
const DB_USERNAME = "admin";
// 数据库密码
const DB_PASSWORD = "admin";
// 数据库授权人
const DB_ROOT = "admin";

// 服务器端口号
const SERVER_PORT = "8082";

// 读取公钥私钥文件
const PRIVATE_KEY = fs.readFileSync(
  path.resolve(__dirname, "./keys/private.key")
);
const PUBLIC_KEY = fs.readFileSync(
  path.resolve(__dirname, "./keys/public.key")
);

// 需要进行token校验的请求
const CHECK_PATHS = [
  "/user/like/music",
  "/music/songIdArr",
  "/user/like",
  "/user/dislike",
  "/user/info",
  "/user/upload/avatar",
  "/dynamic/release",
  "/dynamic/file",
];
module.exports = {
  DB_HOST,
  DB_PORT,
  DB_ROOT,
  DB_NAME,
  DB_USERNAME,
  DB_PASSWORD,
  SERVER_PORT,
  PRIVATE_KEY,
  PUBLIC_KEY,
  CHECK_PATHS,
};
