var express = require('express')
var router = express.Router()
var fs = require('fs')

/* GET users listing. */
router.post('/set', function (req, res, next) {
    fs.writeFileSync(__dirname + '/../config.json', JSON.stringify(req.body))
    res.send('')
})

router.get('/get', function (req, res, next) {
    res.send(fs.readFileSync(__dirname + '/../config.json', 'utf8'))
})

module.exports = router
