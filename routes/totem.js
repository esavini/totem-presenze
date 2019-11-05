var express = require('express')
var request = require('request')
var fs = require('fs')
var router = express.Router()

/* GET users listing. */
router.post('/check', function (req_server, res_server, next_server) {

    var risposta = {
        'nome': '',
        'stato': 0,
        'badge': req_server.body.badge,
        'ora': req_server.body.ora
    }

    var totem = JSON.parse(fs.readFileSync(__dirname + '/../config.json'))

    if (totem.enabled !== true) {
        res_server.send(risposta)
        return
    }

    request.post(totem.endpoint, {
        form: {
            token: totem.token
            , rfid: req_server.body.badge
            , timestamp: parseInt('' + (req_server.body.ora / 1000))
        }
        , headers: {
            'User-Agent': 'RILEVATORE-2019-10-26'
        }
    }, (err, res, body) => {

        if (err) {
            res_server.send(risposta)
            last_check = null

        } else {

            if (res.statusCode === 204) {

                // In caso di risposta senza body ma di successo
                risposta.stato = 1

                res_server.send(risposta)

            } else if (res.statusCode === 200) {
                // In caso di successo con body
                try {

                    body = JSON.parse(body)

                    if (body.errore) {
                        res_server.send(risposta)
                        return
                    }

                    body.stato = 1
                    body.badge = risposta.badge,
                        body.ora = risposta.ora
                    res_server.send(body)

                } catch (e) {
                    res_server.send(risposta)
                }

            } else {

                // In tutti gli altri casi errore
                res_server.send(risposta)
            }
        }
    })

})

var last_check = null

router.get('/config', function (req_server, res_server, next_server) {

    var totem = JSON.parse(fs.readFileSync(__dirname + '/../config.json'))

    var response = {}

    response.enabled = totem.enabled
    response.marquee = totem.marquee

    if (last_check === null || (Date.now() - last_check) > 1000 * 60 * 5) {
        request.post('http://clients1.google.com/generate_204', {}, (err, res, body) => {

            if (err) {
                response.enabled = false
                response.marquee = 'Impossibile connettersi ad internet!'
                res_server.send(response)

            } else {

                if (res.statusCode === 204) {
                    res_server.send(response)
                    last_check = Date.now()

                } else {
                    response.enabled = false
                    response.marquee = 'Impossibile connettersi ad internet!'
                    res_server.send(response)
                }
            }
        })
    } else
        res_server.send(response)

})

module.exports = router
