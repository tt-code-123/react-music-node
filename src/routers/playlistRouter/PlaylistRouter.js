const express = require('express')
const PlaylistModel = require('@/models/PlaylistsInfoModal')

const PlaylistRouter = express.Router()

// 获取推荐歌单列表
PlaylistRouter.get('/recommend', async (req, res, next) => {
  const { pageNum = 1, pageSize = 10 } = req.query
  const todoCount = await PlaylistModel.find({}).count()
  PlaylistModel.find({}, {}, { skip: (pageNum - 1) * pageSize, limit: pageSize })
    .then(playlist => {
      playlist = playlist.map(item => {
        item.playlist_img = '/imgs/playlist_imgs/' + item.playlist_img
        return item
      })
      res.send({ status: 1, data: { playlist, todoCount } })
    })
    .catch(error => {
      console.log(error);
      res.send({ status: 0, msg: "获取歌单列表失败，请重新尝试" })
    })
})

module.exports = PlaylistRouter