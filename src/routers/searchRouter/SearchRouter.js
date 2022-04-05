const express = require('express')
const SingerModel = require('@/models/SingersInfoModel')
const MusicModel = require('@/models/MusicsInfoModel')
const AlbumModel = require('@/models/AlbumsInfoModel')
const PinYin = require('pinyin')
const checkFormat = require('@/utils').checkFormat

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
      newObj.total = musicCount[0].count
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
        newObj.total = musicArray.length
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

// 搜索建议接口
SearchRouter.get('/suggest', async (req, res, next) => {
  const { keywords } = req.query
  const tag = checkFormat(keywords)
  if (tag) {
    try {
      const singer = await SingerModel.find({ singer_name: { $regex: keywords, $options: 'i' } }, { _id: 1, singer_name: 1 }, { limit: 1 })
      const music = await MusicModel.find({ music_name: { $regex: keywords, $options: 'i' } }, { _id: 1, music_name: 1 }, { limit: 1 })
      return res.send({ status: 1, data: { singer, music } })
    } catch (error) {
      return res.send({ status: 0, msg: '获取数据出错，请重新尝试' })
    }
  } else {
    try {
      const singerArr = await SingerModel.find({}, { _id: 1, singer_name: 1 })
      const musicArr = await MusicModel.find({}, { _id: 1, music_name: 1 })
      const singerLetter = singerArr.map(item => {
        const letter = PinYin(item.singer_name, { style: PinYin.STYLE_FIRST_LETTER, heteronym: false })
        item._doc.singerNameLetter = [].concat(...letter).map(item => {
          const iten = item.toUpperCase()
          return iten
        })
        return item
      })
      const singerNormal = singerArr.map(item => {
        const letter = PinYin(item.singer_name, { style: PinYin.STYLE_NORMAL, heteronym: false })
        item._doc.singerNameNormal = [].concat(...letter).map(item => {
          const iten = item.toUpperCase()
          return iten
        })
        return item
      })
      const musicLetter = musicArr.map(item => {
        const letter = PinYin(item.music_name, { style: PinYin.STYLE_FIRST_LETTER, heteronym: false })
        item._doc.musicNameLetter = [].concat(...letter).map(item => {
          const iten = item.toUpperCase()
          return iten
        })
        return item
      })
      const musicNormal = musicArr.map(item => {
        const letter = PinYin(item.music_name, { style: PinYin.STYLE_NORMAL, heteronym: false })
        item._doc.musicNameNormal = [].concat(...letter).map(item => {
          const iten = item.toUpperCase()
          return iten
        })
        return item
      })
      const key = keywords.split('').map(item => {
        const iten = item.toUpperCase()
        return iten
      })
      if (key.length === 1) {
        let singerIndex1 = -1
        let musicIndex1 = -1
        for (let i = 0; i < singerLetter.length; i++) {
          if (singerLetter[i]._doc.singerNameLetter[0] === key[0]) {
            singerIndex1 = i
            break
          }
        }
        for (let j = 0; j < musicLetter.length; j++) {
          if (musicLetter[j]._doc.musicNameLetter[0] === key[0]) {
            musicIndex1 = j
            break
          }
        }
        const singerData1 = singerArr[singerIndex1]
        const musicData1 = musicArr[musicIndex1]
        return res.send({
          status: 1,
          data: {
            singer: singerData1 ? [singerData1] : [],
            music: musicData1 ? [musicData1] : []
          }
        })
      }
      let singerData
      let musicData
      let singerTag = false
      let singerIndex = -1
      let musicTag = false
      let musicIndex = -1
      for (let i = 0; i < singerLetter.length; i++) {
        singerTag = singerLetter[i]._doc.singerNameLetter.join('').includes(key.join(''))
        if (singerTag) {
          singerIndex = i
          break
        }
      }
      for (let j = 0; j < musicLetter.length; j++) {
        musicTag = musicLetter[j]._doc.musicNameLetter.join('').includes(key.join(''))
        if (musicTag) {
          musicIndex = j
          break
        }
      }
      singerData = singerArr[singerIndex]
      musicData = musicArr[musicIndex]
      if (!singerData) {
        for (let i = 0; i < singerNormal.length; i++) {
          singerTag = singerNormal[i]._doc.singerNameNormal.join('').includes(key.join(''))
          if (singerTag) {
            singerIndex = i
            break
          }
        }
        singerData = singerArr[singerIndex]
      }
      if (!musicData) {
        for (let j = 0; j < musicNormal.length; j++) {
          musicTag = musicNormal[j]._doc.musicNameNormal.join('').includes(key.join(''))
          if (musicTag) {
            musicIndex = j
            break
          }
        }
        musicData = musicArr[musicIndex]
      }
      res.send({
        status: 1,
        data: {
          singer: singerData ? [singerData] : [],
          music: musicData ? [musicData] : []
        }
      })
    } catch (error) {
      console.log(error);
      return res.send({ status: 0, msg: '获取数据出错，请重新尝试' })
    }
  }
})


module.exports = SearchRouter