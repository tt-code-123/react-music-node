const express = require('express')
const mongoose = require('mongoose')
const DynamicModel = require('@/models/DynamicsInfoModel')
const UserModel = require('@/models/UsersInfoModel')
const CommentModel = require('@/models/CommentsInfoModel')
const CommentRouter = express.Router()

// 评论回复接口
CommentRouter.post('/add/reply', (req, res, next) => {
  let p_id = req.body.p_id
  if (!p_id) {
    p_id = mongoose.Types.ObjectId()
  }
  CommentModel.create({ ...req.body, p_id })
    .then((data) => {
      UserModel.findById(data.from_id, {
        _id: 1,
        avatar_url: 1,
        username: 1,
      }).then((fromUser) => {
        const newData = { ...data }
        const from_user = { ...fromUser }
        from_user._doc.avatar_url = from_user._doc.avatar_url
          ? '/imgs/user_imgs/' + from_user._doc.avatar_url
          : ''
        newData._doc.from_user = from_user._doc
        if (data.to_id) {
          UserModel.findById(data.to_id, {}).then((toUser) => {
            const to_user = { ...toUser }
            to_user._doc.avatar_url = to_user._doc.avatar_url
              ? '/imgs/user_imgs/' + to_user._doc.avatar_url
              : ''
            newData._doc.to_user = to_user._doc
            return res.send({ status: 1, data: newData })
          })
        } else {
          return res.send({ status: 1, data: newData })
        }
      })
    })
    .catch((err) => {
      res.send({ status: 0, msg: '回复失败，请重新尝试。' })
    })
})

module.exports = CommentRouter
