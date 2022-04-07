const express = require('express')
const DynamicModel = require('@/models/DynamicsInfoModel')
const UserModel = require('@/models/UsersInfoModel')
const CommentModel = require('@/models/CommentsInfoModel')
const DynamicRouter = express.Router()

// 获取动态和评论信息
DynamicRouter.get('/all', (req, res, next) => {
  const { currentUserId } = req.query
  DynamicModel.find({}, {}, { sort: { release_time: -1 } }).then(data => {
    const newData = [...data]
    UserModel.findById(currentUserId).then(user => {
      if (user.like_dynamic.length) {
        for (let i = 0; i < user.like_dynamic.length; i++) {
          for (let j = 0; j < newData.length; j++) {
            if (JSON.stringify(user.like_dynamic[i]) === JSON.stringify(newData[j]._id)) {
              newData[j]._doc.like = true
            } else {
              newData[j]._doc.like = false
            }
          }
        }
      }
    })
    for (let i = 0; i < newData.length; i++) {
      UserModel.findById(newData[i].user_id, { _id: 1, username: 1, avatar_url: 1, }).then(singer => {
        const newSinger = { ...singer }
        newSinger._doc.avatar_url = newSinger._doc.avatar_url ? '/imgs/user_imgs/' + newSinger._doc.avatar_url : ''
        newData[i]._doc.userInfo = newSinger
      })
      CommentModel.find({ dynamic_id: newData[i]._id }).then(comment => {
        const newComment = [...comment]
        if (newComment.length) {
          for (let j = 0; j < newComment.length; j++) {
            UserModel.findById(newComment[j].from_id, { _id: 1, username: 1, avatar_url: 1 }).then(singer => {
              const newSinger = { ...singer }
              newSinger._doc.avatar_url = newSinger._doc.avatar_url ? '/imgs/user_imgs/' + newSinger._doc.avatar_url : ''
              newComment[j]._doc.from_user = newSinger
            })
            if (newComment[j].to_id) {
              UserModel.findById(newComment[j].to_id, { _id: 1, username: 1, avatar_url: 1 }).then(singer => {
                const newSinger = { ...singer }
                newSinger._doc.avatar_url = newSinger._doc.avatar_url ? '/imgs/user_imgs/' + newSinger._doc.avatar_url : ''
                newComment[j]._doc.to_user = newSinger
              })
            }
          }
          setTimeout(() => {
            const cInfo = newComment.map(item => {
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
  }).catch(error => {
    console.log(error);
    res.send({ status: 0, msg: '请求动态出错，请重新尝试！' })
  })
})

module.exports = DynamicRouter