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

    if(totem.enabled !== true) {
        res_server.send(risposta)
        return
    }

    request.post(totem.endpoint, {
        form: {
            token: totem.token
            , rfid: req_server.body.badge
            , timestamp: parseInt('' + (req_server.body.ora / 1000))
        }
    }, (err, res, body) => {

        if (err) {
            res_server.send(risposta)

        } else {

            if (res.statusCode === 204) {

                // In caso di risposta senza body ma di successo
                risposta.stato = 1

                res_server.send(risposta)


            } else if (res.statusCode === 200) {
                // In caso di successo con body
                try {

                    body = JSON.parse(body)

                    if (body.errore !== undefined)
                        res_server.send(risposta)

                    else {

                        if (body.nome !== undefined)
                            risposta.nome = body.nome

                        risposta.stato = 1

                        res_server.send(risposta)
                    }
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

router.get('/config', function (req_server, res_server, next_server) {

    var totem = JSON.parse(fs.readFileSync(__dirname + '/../config.json'))

    var response = {}

    response.enabled = totem.enabled
    response.marquee = totem.marquee

    res_server.send(response)

})

module.exports = router
