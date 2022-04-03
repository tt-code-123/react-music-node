const express = require('express')
const MusicModel = require('../../models/MusicsInfoModel')
const AlbumModel = require('@/models/AlbumsInfoModel')
const { pageFilter } = require('../../utils')
const SingerModel = require('@/models/SingersInfoModel')
const mongoose = require('mongoose')

const MusicRouter = express.Router()

// 获取全部歌曲列表
MusicRouter.get('/list', (req, res, next) => {
  const { pageNum, pageSize } = req.query
  if (pageNum && pageSize) {
    MusicModel.find({})
      .then(music => res.send({ status: 1, data: pageFilter(music, pageNum, pageSize) }))
      .catch(error => {
        console.log(error);
        res.send({ status: 0, msg: "获取歌曲列表失败，请重新尝试" })
      })
  } else res.send({ status: 0, msg: "请传递参数" })
})

// 根据歌手id获取歌曲列表
MusicRouter.get('/artistId', (req, res, next) => {
  const { _id, pageNum = 1, pageSize = 10 } = req.query
  if (_id) {
    let musicCount = 0
    let musicInfo = []
    const data = {}
    MusicModel.aggregate([
      {
        $match: {
          singer_id: mongoose.Types.ObjectId(_id)
        }
      },
      {
        $group: {
          _id: '$singer_id',
          musicCount: { $sum: 1 }
        }
      }
    ]).then(music => {
      musicCount = music[0].musicCount
    })
    MusicModel.find({ singer_id: _id }, { _id: 1, music_name: 1, singer_id: 1, album_id: 1 }, { skip: (pageNum - 1) * pageSize, limit: pageSize })
      .then(music => {
        new Promise((resolve) => {
          music.map(async item => {
            let album = await AlbumModel.findById(item.album_id, { album_name: 1 })
            musicInfo.push({ ...item._doc, album_name: album.album_name })
          })
          setTimeout(() => {
            resolve()
          });
        }).then(() => {
          SingerModel.findById(music[0].singer_id, { singer_name: 1 }).then(singer => {
            musicInfo = musicInfo.map(item => {
              item.singer_name = singer.singer_name
              return item
            })
            data.musicInfo = musicInfo
            data.musicCount = musicCount
            res.send({ status: 1, data })
          })
        })
      })
      .catch(error => {
        console.log(error);
        res.send({ status: 0, msg: '获取歌曲列表失败，请重新尝试' })
      })
  } else res.send({ status: 0, msg: "请传递参数" })
})

// 根据歌曲ID获取歌曲
MusicRouter.get('/songId', (req, res, next) => {
  const { _id } = req.query
  if (_id) {
    MusicModel.findById(_id)
      .then(music => {
        AlbumModel.findById(music.album_id, { album_name: 1 }).then(album => {
          SingerModel.findById(music.singer_id, { singer_name: 1 }).then(singer => {
            music.music_img = '/imgs/music_and_album_imgs/' + music.music_img
            music.music_url = '/audio/' + music.music_url
            const data = { ...music._doc, singer_name: singer.singer_name, album_name: album.album_name }
            res.send({ status: 1, data })
          })
        })
      })
      .catch(error => {
        console.log(error);
        res.send({ status: 0, msg: '获取歌曲列表失败，请重新尝试' })
      })
  } else res.send({ status: 0, msg: '请传递参数' })
})

// 根据专辑ID获取歌曲
MusicRouter.get('/albumId', (req, res, next) => {
  const { _id } = req.query
  if (_id) {
    MusicModel.find({ album_id: _id }, { _id: 1, music_name: 1, singer_id: 1, music_second: 1 }).then(music => {
      SingerModel.findById(music[0].singer_id, { singer_name: 1 }).then(singer => {
        music = music.map(item => {
          item._doc.singer_name = singer.singer_name
          return item
        })
        res.send({ status: 1, data: music })
      })
    }).catch(error => {
      console.log(error);
      res.send({ status: 0, msg: '获取歌曲信息失败，请重新尝试' })
    })
  } else res.send({ status: 0, msg: '请传递参数' })
})

// 根据歌曲ID数组获取歌曲
MusicRouter.get('/songIdArr', (req, res, next) => {
  const { songIdArr } = req.query
  if (songIdArr) {
    new Promise((resolve, reject) => {
      const songArr = []
      songIdArr.forEach(item => {
        MusicModel.findById(item, { music_tag: 0, album_id: 0 })
          .then(music => {
            SingerModel.findById(music.singer_id, { singer_name: 1 }).then(singer => {
              music._doc.singer_name = singer.singer_name
              music._doc.isChecked = false
              songArr.push(music)
            })
          })
      })
      setTimeout(() => {
        resolve(songArr)
      }, 100)
    })
      .then(song => {
        const songInfo = song.map(item => {
          item.music_url = '/audio/' + item.music_url
          item.music_img = '/imgs/music_and_album_imgs/' + item.music_img
          return item
        })
        res.send({ status: 1, data: songInfo })
      })
      .catch(error => {
        console.log(error);
        res.send({ status: 0, msg: '请求歌曲列表失败，请重新尝试' })
      })
  } else {
    res.send({ status: 1, data: [] })
  }

})


// 根据专辑ID获取歌曲ID
MusicRouter.get('/musicId', (req, res, next) => {
  const { albumId } = req.query
  MusicModel.find({ album_id: albumId }, { _id: 1 })
    .then(music => {
      const data = music.map(item => item._id)
      res.send({ status: 1, data })
    })
    .catch(err => {
      res.send({ status: 0, msg: '获取歌曲ID信息失败，请重新尝试' })
    })
})

module.exports = MusicRouter