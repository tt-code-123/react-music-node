require('module-alias/register')
const express = require('express')
const mongoose = require('mongoose')
const config = require('@/config/index')
const MusicRouter = require('@/routers/musicRouter/MusicRouter')
const SingerRouter = require('@/routers/SingerRouter/SingerRouter')
const AlbumRouter = require('@/routers/albumRouter/AlbumRouter')
const UserRouter = require('@/routers/userRouter/UserRouter')
const ImageRouter = require('@/routers/imageRouter/ImageRouter')
const PlaylistRouter = require('@/routers/playlistRouter/PlaylistRouter')
const SearchRouter = require('@/routers/searchRouter/SearchRouter')
const tokenVerify = require('@/middleware/token_verify')
const cors = require('cors');
const app = express()
// 解析body里面的参数
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())
// 开起静态服务器
app.use(express.static('./public'))

app.use(tokenVerify)
// 使用路由
app.use('/music', MusicRouter)
app.use('/singer', SingerRouter)
app.use('/album', AlbumRouter)
app.use('/user', UserRouter)
app.use('/image', ImageRouter)
app.use('/playlist', PlaylistRouter)
app.use('/search', SearchRouter)

// 通过mongoose连接数据库
const { DB_HOST, DB_PORT, DB_ROOT, DB_USERNAME, DB_NAME, DB_PASSWORD, SERVER_PORT, } = config
mongoose.connect(`mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=${DB_ROOT}`, { useNewUrlParser: true })
  .then(() => {
    console.log('连接数据库成功!!!')
    // 只有当连接上数据库后才去启动服务器
    app.listen(SERVER_PORT, () => {
      console.log(`服务器启动成功, 请访问: http://localhost:${SERVER_PORT}`)
    })
  })
  .catch(error => {
    console.error('连接数据库失败', error)
  })