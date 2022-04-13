const express = require('express')
const mongoose = require('mongoose');
const DynamicModel = require('@/models/DynamicsInfoModel')
const UserModel = require('@/models/UsersInfoModel')
const CommentModel = require('@/models/CommentsInfoModel')
const CommentRouter = express.Router()

// 评论回复接口
CommentRouter.post('/add/reply', (req, res, next) => {
  let p_id = req.body.p_id
  if (!p_id) {
    p_id = mongoose.Types.ObjectId();
  }
  CommentModel.create({ ...req.body, p_id })
    .then(data => res.send({ status: 1, data }))
    .catch(err => {
      res.send({ status: 0, msg: '回复失败，请重新尝试。' })
    })

})



module.exports = CommentRouter