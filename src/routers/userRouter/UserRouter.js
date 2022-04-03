const express = require('express')
const mongoose = require('mongoose')
const UserModel = require('../../models/UsersInfoModel')
const md5 = require('blueimp-md5')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { PRIVATE_KEY, SERVER_PORT } = require('../../config')

const jwt = require('jsonwebtoken')
const UserRouter = express.Router()

// 登录
UserRouter.post('/login', (req, res, next) => {
  const { username, password } = req.body
  // console.log(username, password);
  UserModel.findOne({ username, password: md5(password) })
    .then(data => {
      if (data) {
        const token = jwt.sign({ id: data._id }, PRIVATE_KEY, { expiresIn: '7 days', algorithm: 'RS256' })
        res.send({ status: 1, data, token })
      }
      else res.send({ status: 0, msg: "用户名或密码错误" })
    })
    .catch(error => {
      console.log(error);
      res.send({ status: 0, msg: "登录异常，请重新登录" })
    })
})

// 注册
UserRouter.post('/register', (req, res, next) => {
  const { username, password } = req.body
  UserModel.findOne({ username })
    .then(data => {
      if (data) {
        res.send({ status: 0, msg: "用户名存在" })
      } else {
        UserModel.create({ username, password: md5(password) })
          .then(data => res.send({ status: 1, data }))
      }
    })
    .catch(error => {
      console.log(error);
      res.send({ status: 0, msg: "注册异常，请重新注册" })
    })
})

// 上传头像
const dirPath = path.join(__dirname, '../..', 'public/imgs/user_imgs')
const storage = multer.diskStorage({
  // 文件存储的位置
  destination: function (req, file, cb) {
    // console.log(file);
    if (!fs.existsSync(dirPath)) {
      fs.mkdir(dirPath, (err) => {
        if (err) {
          console.log(err);
        } else {
          cb(null, dirPath)
        }
      })
    } else {
      cb(null, dirPath)
    }
  },
  // 文件名字
  filename: function (req, file, cb) {
    // path.extname() 取文件后缀名
    // file.originalname 原始文件名字
    var ext = path.extname(file.originalname)
    cb(null, file.fieldname + '-' + Date.now() + ext)
  }
})

const upload = multer({ storage })
const uploadSingle = upload.single('image')

// 上传头像
UserRouter.post('/upload/avatar', (req, res, next) => {
  const { _id } = req.body
  // const _id = 6197956 + 'b0e76522b7a3d3c27'
  if (_id) {
    UserModel.findById(_id, (error, data) => {
      if (data.avatar_url) {
        fs.unlink(path.join(dirPath, data.avatar_url), (err) => {
          if (err) {
            console.log(err)
            return res.send({ status: 0, msg: '删除文件失败' })
          }
        })
      }
      uploadSingle(req, res, function (err) { //错误处理
        if (err) return res.send({ status: 0, msg: '上传头像失败' })
        var file = req.file
        UserModel.updateOne({ _id }, { $set: { avatar_url: file.filename } })
          .then(data => {
            res.send({
              status: 1,
              data: {
                name: file.filename,
                data,
                url: `http://localhost:${SERVER_PORT}/imgs/user_imgs/` + file.filename
              }
            })
          })
          .catch(error => {
            console.log(error);
            res.send({ status: 0, msg: "上传头像失败" })
          })
      })
    })
  } else {
    res.send({ status: 0, msg: "请传递参数" })
  }
})

// 添加喜欢歌曲
UserRouter.post('/like', (req, res, next) => {
  const { musicIdArr, userId } = req.body
  UserModel.findById(userId)
    .then(user => {
      const prevLike = user.like_music
      const paramsLike = musicIdArr.map(item => mongoose.Types.ObjectId(item))
      const allLike = [...prevLike, ...paramsLike]
      const jsonLike = allLike.map(item => JSON.stringify(item))
      const newLike = [...new Set(jsonLike)]
      const currentLike = newLike.map(item => mongoose.Types.ObjectId(JSON.parse(item)))
      UserModel.updateOne({ _id: userId }, { $set: { like_music: currentLike } })
        .then(() => {
          res.send({ status: 1, data: true })
        })
        .catch(err => {
          console.log(err);
          res.send({ status: 0, msg: '添加喜欢音乐失败' })
        })
    })
    .catch(err => {
      console.log(err);
      res.send({ status: 0, msg: '当前用户不存在' })
    })
})

// 删除喜欢歌曲
UserRouter.post('/dislike', (req, res, next) => {
  const { musicIdArr, userId } = req.body
  UserModel.findById(userId)
    .then(user => {
      let currentLike = []
      const musicIdArrs = musicIdArr.map(item => JSON.stringify(item))
      const prevLike = user.like_music.map(item => JSON.stringify(item))
      if (musicIdArr.length > 0) {
        for (var i of prevLike) {
          const likeMusic = musicIdArrs.find(item => {
            return item === i
          })
          if (!likeMusic) {
            currentLike.push(i)
          }
        }
      }
      if (currentLike.length > 0) {
        currentLike = currentLike.map(item => mongoose.Types.ObjectId(JSON.parse(item)))
      }
      UserModel.updateOne({ _id: userId }, { $set: { like_music: currentLike } })
        .then(() => {
          res.send({ status: 1, data: true })
        })
        .catch(err => {
          console.log(err);
          res.send({ status: 0, msg: '删除喜欢音乐失败' })
        })
    })
    .catch(err => {
      console.log(err);
      res.send({ status: 0, msg: '当前用户不存在' })
    })
})


UserRouter.get('/like/music', (req, res, next) => {
  const { _id } = req.query
  UserModel.findById(_id, { _id: 1, like_music: 1 })
    .then(data => {
      res.send({ status: 1, data })
    })
    .catch(err => {
      console.log(err);
      res.send({ status: 0, msg: '获取喜欢歌曲列表出错，请重新尝试' })
    })
})

module.exports = UserRouter