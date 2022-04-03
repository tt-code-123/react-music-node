const express = require('express')
const AlbumModel = require('@/models/AlbumsInfoModel')
const mongoose = require('mongoose')
const SingerModel = require('@/models/SingersInfoModel')
const AlbumRouter = express.Router()

// 获取推荐专辑列表
AlbumRouter.get('/recommend', (req, res, next) => {
  const { pageNum = 1, pageSize = 10 } = req.query
  const data = []
  AlbumModel.find({}, { release_company: 0, album_introduction: 0 }, { skip: (pageNum - 1) * pageSize, limit: pageSize }).then(album => {
    album.forEach((_, index) => {
      SingerModel.findById(album[index].singer_id, { singer_name: 1 }).then(singer => {
        album[index]._doc.singer_name = singer.singer_name
        album[index].album_img = '/imgs/music_and_album_imgs/' + album[index].album_img
        data.push({
          ...album[index]._doc
        })
        if (index === album.length - 1) {
          res.send({ status: 1, data: { totalCount: album.length, albumArr: data } })
        }
      })
    })


  })
    .catch(err => {
      res.send({ staus: 0, msg: '获取专辑列表失败，请重新尝试' })
    })
})

// 根据歌手Id获取专辑信息
AlbumRouter.get('/artistId', (req, res, next) => {
  const { _id, pageNum = 1, pageSize = 5 } = req.query
  if (_id) {
    let albumCount = 0
    const albumInfo = []
    const data = {}
    AlbumModel.aggregate([
      {
        $match: {
          singer_id: mongoose.Types.ObjectId(_id)
        }
      },
      {
        $group: {
          _id: '$singer_id',
          albumCount: {
            $sum: 1
          }
        }
      }
    ]).then(album => {
      albumCount = album[0].albumCount
    })
    AlbumModel.find({ singer_id: _id }, { release_company: 0, album_introduction: 0 }, { skip: (pageNum - 1) * pageSize, limit: pageSize })
      .then(async album => {
        const singer = await SingerModel.findById(_id)
        album.map(item => {
          item.album_img = '/imgs/music_and_album_imgs/' + item.album_img
          albumInfo.push({ ...item._doc, singer_name: singer.singer_name })
        })
        data.albumInfo = albumInfo
        data.albumCount = albumCount
        data.singerName = singer.singer_name
        res.send({ status: 1, data })
      })
      .catch(error => res.send({ status: 0, msg: "获取专辑列表失败，请重新尝试" }))
  } else {
    res.send({ status: 0, msg: "请传递参数" })
  }
})

// 根据专辑Id获取专辑信息和歌曲信息
AlbumRouter.get('/albumId', (req, res, next) => {
  const { _id } = req.query
  if (_id) {
    AlbumModel.findById(_id)
      .then(album => {
        album.album_img = '/imgs/music_and_album_imgs/' + album.album_img
        SingerModel.findById(album.singer_id).then(singer => {
          album._doc.singer_name = singer.singer_name
          res.send({ status: 1, data: album })
        })
      })
      .catch(err => {
        console.log(err);
        res.send({ status: 0, msg: '请求专辑信息失败，请重试' })
      })
  } else res.send({ status: 0, msg: '请传递参数' })
})

// 获取歌手其他专辑
AlbumRouter.get('/other', (req, res, next) => {
  const { albumId, singerId } = req.query
  AlbumModel.find({ $and: [{ singer_id: singerId }, { _id: { $ne: albumId } }] }, { release_company: 0, album_introduction: 0 }, { limit: 5 }).then(album => {
    SingerModel.findById(singerId, { singer_name: 1 }).then(singer => {
      const data = album.map(item => {
        item._doc.singer_name = singer.singer_name
        item.album_img = '/imgs/music_and_album_imgs/' + item.album_img
        return item
      })
      res.send({ status: 1, data })
    })
  }).catch(error => {
    console.log(error);
    res.send({ status: 0, msg: '请求专辑信息失败，请重新尝试' })
  })
})

module.exports = AlbumRouter