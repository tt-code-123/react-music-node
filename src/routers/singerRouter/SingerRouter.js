const express = require('express')
const PinYin = require('pinyin')
const SingerModel = require('../../models/SingersInfoModel')

const SingerRouter = express.Router()

// 获取推荐歌手列表
SingerRouter.get('/recommend', (req, res, next) => {
  const { pageNum = 1, pageSize = 6 } = req.query
  SingerModel.find({}, {}, { skip: (pageNum - 1) * pageSize, limit: pageSize })
    .then(singer => {
      const data = singer.map(item => {
        item.singer_img = '/imgs/singer_imgs/' + item.singer_img
        return item
      })
      res.send({ status: 1, data })
    })
    .catch(error => {
      console.log(error);
      res.send({ status: 0, msg: "获取歌手列表失败，请重新尝试" })
    })
})

// 根据歌手id获取歌手信息
SingerRouter.get('/singerId', (req, res, next) => {
  const { _id } = req.query
  SingerModel.findById(_id)
    .then(singer => {
      singer.singer_img = '/imgs/singer_imgs/' + singer.singer_img
      res.send({ status: 1, data: singer })
    })
    .catch(error => {
      console.log(error);
      res.send({ status: 0, msg: '获取歌手失败，请重新尝试' })
    })
})

// 根据国籍、性别、获取歌手信息
SingerRouter.get('/list', (req, res, next) => {
  const { pageSize = 12, pageNum = 1, gender, language, initial } = req.query
  SingerModel.find({}, { _id: 1, singer_name: 1 }).then(singerArrs => {
    SingerModel.find({ singer_language: language, singer_gender: gender }, { singer_introduction: 0, singer_gender: 0, singer_language: 0 }, { limit: pageSize, skip: (pageNum - 1) * pageSize })
      .then(singer => {
        const data = {
          totalCount: 0,
          singerArr: []
        }
        if (singer.length === 0) {
          return res.send({ status: 1, data })
        }
        const letterArr = singerArrs.map(item => {
          const letter = PinYin(item.singer_name, { style: PinYin.STYLE_FIRST_LETTER, heteronym: false })
          item.singer_name = letter[0][0][0].toLocaleUpperCase()
          return item
        })
        const letterArrs = letterArr.filter(item => item.singer_name === initial)
        if (letterArrs.length === 0) {
          return res.send({ status: 1, data })
        }
        const sArr = []
        for (var i = 0; i < singer.length; i++) {
          for (var j = 0; j < letterArrs.length; j++) {
            if (JSON.stringify(singer[i]._id) === JSON.stringify(letterArrs[j]._id)) {
              sArr.push(singer[i])
            }
          }
        }
        if (sArr.length === 0) {
          return res.send({ status: 1, data })
        }
        const singerArr = sArr.map(item => {
          item.singer_img = '/imgs/singer_imgs/' + item.singer_img
          return item
        })
        data.singerArr = singerArr
        data.totalCount = singerArr.length
        res.send({ status: 1, data })
      })
      .catch(error => {
        console.log(error);
        res.send({ status: 0, msg: '获取歌手列表失败，请重新尝试' })
      })
  })

})

module.exports = SingerRouter