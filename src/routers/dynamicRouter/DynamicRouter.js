const express = require('express')
const path = require('path')
const multer = require('multer')
const fs = require('fs')
const DynamicModel = require('@/models/DynamicsInfoModel')
const UserModel = require('@/models/UsersInfoModel')
const CommentModel = require('@/models/CommentsInfoModel')
const DynamicRouter = express.Router()

// 获取动态和评论信息
DynamicRouter.get('/all', (req, res, next) => {
  const { currentUserId } = req.query
  DynamicModel.find({}, {}, { sort: { release_time: -1 } })
    .then((data) => {
      const newData = [...data]
      UserModel.findById(currentUserId).then((user) => {
        if (user.like_dynamic.length) {
          for (let i = 0; i < user.like_dynamic.length; i++) {
            for (let j = 0; j < newData.length; j++) {
              if (
                JSON.stringify(user.like_dynamic[i]) ===
                JSON.stringify(newData[j]._id)
              ) {
                newData[j]._doc.like = true
              }
            }
          }
        }
      })
      for (let i = 0; i < newData.length; i++) {
        UserModel.findById(newData[i].user_id, {
          _id: 1,
          username: 1,
          avatar_url: 1,
        }).then((singer) => {
          const newSinger = { ...singer }
          newSinger._doc.avatar_url = newSinger._doc.avatar_url
            ? '/imgs/user_imgs/' + newSinger._doc.avatar_url
            : ''
          newData[i]._doc.userInfo = newSinger
        })
        CommentModel.find({ dynamic_id: newData[i]._id }).then((comment) => {
          const newComment = [...comment]
          if (newComment.length) {
            for (let j = 0; j < newComment.length; j++) {
              UserModel.findById(newComment[j].from_id, {
                _id: 1,
                username: 1,
                avatar_url: 1,
              }).then((singer) => {
                const newSinger = { ...singer }
                newSinger._doc.avatar_url = newSinger._doc.avatar_url
                  ? '/imgs/user_imgs/' + newSinger._doc.avatar_url
                  : ''
                newComment[j]._doc.from_user = newSinger
              })
              if (newComment[j].to_id) {
                UserModel.findById(newComment[j].to_id, {
                  _id: 1,
                  username: 1,
                  avatar_url: 1,
                }).then((singer) => {
                  const newSinger = { ...singer }
                  newSinger._doc.avatar_url = newSinger._doc.avatar_url
                    ? '/imgs/user_imgs/' + newSinger._doc.avatar_url
                    : ''
                  newComment[j]._doc.to_user = newSinger
                })
              }
            }
            setTimeout(() => {
              const cInfo = newComment.map((item) => {
                item._doc.isShowArea = false
                item._doc.value = ''
                return item
              })
              newData[i]._doc.commentInfo = cInfo
              newData[i]._doc.isShowArea = false
              newData[i]._doc.value = ''
            }, 100)
          } else {
            newData[i]._doc.commentInfo = []
            newData[i]._doc.isShowArea = false
            newData[i]._doc.value = ''
          }
        })
      }
      setTimeout(() => {
        res.send({ status: 1, data: newData })
      }, 200)
    })
    .catch((error) => {
      console.log(error)
      res.send({ status: 0, msg: '请求动态出错，请重新尝试！' })
    })
})

// 上传图片文件
const dirPath = path.join(__dirname, '../../..', 'public/imgs/dynamic_imgs')
const storage = multer.diskStorage({
  // 文件存储的位置
  destination: function (req, file, cb) {
    // console.log(file);
    if (!fs.existsSync(dirPath)) {
      fs.mkdir(dirPath, (err) => {
        if (err) {
          console.log(err)
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
  },
})

const upload = multer({ storage })
const uploadArr = upload.array('images')
DynamicRouter.post('/file', (req, res, next) => {
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Content-Length, authorization',
  )
  uploadArr(req, res, (err) => {
    if (err) {
      console.log('err', err)
      return res.send({ status: 0, msg: '上传文件失败' })
    }
    var file = req.files
    const newFile = file.map((item) => {
      return (item.filename = '/imgs/dynamic_imgs/' + item.filename)
    })
    res.send({ status: 1, data: newFile })
  })
})

// 发布动态
DynamicRouter.post('/release', (req, res, next) => {
  DynamicModel.create({ ...req.body })
    .then((data) => {
      UserModel.findById(data.user_id, {
        _id: 1,
        username: 1,
        avatar_url: 1,
      }).then((user) => {
        const newUser = { ...user }
        newUser._doc.avatar_url = '/imgs/user_imgs/' + newUser._doc.avatar_url
        const newData = { ...data }
        newData._doc.isShowArea = false
        newData._doc.value = ''
        newData._doc.like = false
        newData._doc.commentInfo = []
        newData._doc.userInfo = newUser._doc
        res.send({ status: 1, data: newData._doc })
      })
    })
    .catch((err) => {
      res.send({ status: 0, msg: '发布动态失败，请重新尝试。' })
    })
})

module.exports = DynamicRouter
