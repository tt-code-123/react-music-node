const express = require('express')
const fs = require('fs')
const ImageRouter = express.Router()

// 获取轮播图的url
ImageRouter.get('/banner', (req, res, next) => {
  fs.readdir('public/imgs/banner_imgs', (err, file) => {
    if (!err) {
      file = file.map(item => ('/imgs/banner_imgs/' + item))
      res.send({ status: 1, data: file })
    } else {
      res.send({ status: 0, msg: '请求出错！' })
    }
  })
})

// 获取专辑轮播图的url
ImageRouter.get('/albumBanner', (req, res, next) => {
  fs.readdir('public/imgs/album_banner_imgs', (err, file) => {
    if (!err) {
      file = file.map(item => ('/imgs/album_banner_imgs/' + item))
      res.send({ status: 1, data: file })
    } else {
      res.send({ status: 0, msg: '请求出错！' })
    }
  })
})

// 获取tages的url
ImageRouter.get('/tage', (req, res, next) => {
  fs.readdir('public/imgs/tage_imgs', (err, file) => {
    if (!err) {
      file = file.map(item => ('/imgs/tage_imgs/' + item))
      res.send({ status: 1, data: file })
    } else {
      res.send({ status: 0, msg: '请求出错！' })
    }
  })
})

// 下载接口
ImageRouter.get('/download', (req, res, next) => {
  // var path="./1.jpg";
  // var f = fs.createReadStream(path);
  // res.writeHead(200, {
  //   'Content-Type': 'application/force-download',
  //   'Content-Disposition': 'attachment; filename=1.jpg'
  // });
  // f.pipe(res);
  const { audioUrl } = req.query
  const url = audioUrl
  res.download(`public${url}`)
})

module.exports = ImageRouter