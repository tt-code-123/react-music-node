const express = require('express')
const SingerModel = require('@/models/SingersInfoModel')
const MusicModel = require('@/models/MusicsInfoModel')
const AlbumModel = require('@/models/AlbumsInfoModel')

const SearchRouter = express.Router()

// 搜索接口
SearchRouter.get('/all', async (req, res, next) => {
  const { inputValue, pageSize = 15, pageNum = 1 } = req.query
  let singerArray = await SingerModel.find({ singer_name: { $regex: inputValue, $options: 'i' } }, { singer_introduction: 0 })
  let musicArray = await MusicModel.find({ music_name: { $regex: inputValue, $options: 'i' } }, { music_url: 0, music_lyrics: 0, music_tag: 0, music_img: 0 })
  if (singerArray.length > 0) {
    try {
      let musicArr = await MusicModel.find({ singer_id: singerArray[0]._id }, { music_url: 0, music_lyrics: 0, music_tag: 0, music_img: 0 }, { skip: (pageNum - 1) * pageSize, limit: pageSize })
      let albumArr = await AlbumModel.find({ singer_id: singerArray[0]._id }, { album_introduction: 0, release_company: 0 })
      let musicCount = await MusicModel.aggregate([
        {
          $match: {
            singer_id: singerArray[0]._id
          }
        },
        {
          $group: {
            _id: '$singer_id',
            count: { $sum: 1 }
          }
        }
      ])
      let albumCount = await AlbumModel.aggregate([
        {
          $match: {
            singer_id: singerArray[0]._id
          }
        },
        {
          $group: {
            _id: '$singer_id',
            count: { $sum: 1 }
          }
        }
      ])
      singerArray = singerArray.map(item => {
        item.singer_img = '/imgs/singer_imgs/' + item.singer_img
        return item
      })
      albumArr = albumArr.map(item => {
        item.album_img = '/imgs/music_and_album_imgs/' + item.album_img
        item._doc.singer_name = singerArray[0].singer_name
        return item
      })
      const newObj = {}
      newObj.singerList = singerArray
      newObj.musicList = musicArr
      newObj.albumList = albumArr
      newObj.musicCount = musicCount[0].count
      newObj.albumCount = albumCount[0].count
      res.send({ status: 1, data: newObj })
    } catch (error) {
      res.send({ status: 0, msg: '请求出错，请重新尝试' })
    }
  } else if (musicArray.length > 0) {
    try {
      let musicCount = []
      let albumCount = []
      new Promise((resolve) => {
        let singerArr = []
        let albumArr = []
        musicArray.forEach(item => {
          SingerModel.findOne({ _id: item.singer_id }, { singer_introduction: 0 }).then(res => {
            singerArr.push(res)
          })
          AlbumModel.findOne({ _id: item.album_id }, { album_introduction: 0, release_company: 0 }).then(res => {
            albumArr.push(res)
          })
        })
        setTimeout(() => {
          resolve({ singerArr, albumArr })
        }, 100)
      }).then(async (data) => {
        musicCount = await MusicModel.aggregate([
          {
            $match: {
              singer_id: data.singerArr[0]._id
            }
          },
          {
            $group: {
              _id: '$singer_id',
              count: { $sum: 1 }
            }
          }
        ])
        albumCount = await AlbumModel.aggregate([
          {
            $match: {
              singer_id: data.singerArr[0]._id
            }
          },
          {
            $group: {
              _id: '$singer_id',
              count: { $sum: 1 }
            }
          }
        ])
        const singerArr = data.singerArr.map(item => {
          item.singer_img = '/imgs/singer_imgs/' + item.singer_img
          return item
        })
        const albumArr = data.albumArr.map(item => {
          item.album_img = '/imgs/music_and_album_imgs/' + item.album_img
          singerArr.forEach(iten => {
            if (String(iten._id) == String(item.singer_id)) {
              item._doc.singer_name = iten.singer_name
            }
          })
          return item
        })
        let newObj = {}
        newObj.singerList = singerArr
        newObj.musicList = musicArray
        newObj.albumList = albumArr
        newObj.musicCount = musicCount[0].count
        newObj.albumCount = albumCount[0].count
        res.send({ status: 1, data: newObj })
      })
    } catch (error) {
      console.log(error);
      res.send({ status: 0, msg: '请求出错，请重新尝试' })
    }
  } else {
    res.send({ status: 1, data: {}, msg: '服务器繁忙' })
  }
})

module.exports = SearchRouter