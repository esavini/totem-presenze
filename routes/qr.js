var express = require('express')
var request = require('request')
var fs = require('fs')
var router = express.Router()

/* GET users listing. */
router.get('/', function (req_server, res_server, next_server) {

    var totem = JSON.parse(fs.readFileSync(__dirname + '/../config.json'))

    if (totem.enabled !== true) {
        res_server.send({
            code: null
        })
        return
    }

    request.post(totem.endpoint.replace('/presenze.php', '/qr.php'), {
        form: {
            token: totem.token
        }
        , headers: {
            'User-Agent': 'RILEVATORE-2019-10-26'
        }
    }, (err, res, body) => {

        if (err) {
            res_server.send({
                'code': null
            })

        } else {

            if (res.statusCode !== 200) {

                // In caso di risposta senza body ma di successo
                res_server.send({
                    'code': null
                })

            } else if (res.statusCode === 200) {
                // In caso di successo con body
                res_server.send(body)

            }
        }
    })
})

module.exports = router
