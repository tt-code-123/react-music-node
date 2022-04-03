const { CHECK_PATHS, PUBLIC_KEY } = require('../config')

const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
  const url = req.url.split('?')[0]

  if (CHECK_PATHS.indexOf(url) === -1) {
    return next()
  }
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).send({
      status: 0,
      msg: "您没有登录，需要登录才能使用"
    })
  }

  jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] }, (err, data) => {
    if (err) {
      return res.status(401).send({
        status: 2,
        msg: 'token过期失效'
      })
    } else {
      req.user = data
      return next()
    }
  })
}

