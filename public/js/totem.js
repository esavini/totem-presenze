window.addEventListener('load', function () {
    var orologio = document.getElementById('ora')

    setInterval(function () {
        orologio.innerText = new Date().toLocaleTimeString()
    }, 250)

    const N_MAX_RILEVAZIONI_ELENCO = 10

    var rilevazioni = []

    var codice = ''
    var invioInCorso = false
    var avvio = true

    var result = document.getElementById('result')
    var nome = document.getElementById('nome')
    var badge = document.getElementById('badge')
    var ultimi = document.getElementById('ultimi')

    window.addEventListener('keypress', function (e) {

        if (e.key !== 'Enter')
            codice += e.key

        else {
            elabora(codice)
            codice = ''
        }
    })

    var to = null

    function elabora (codice) {

        if (invioInCorso || avvio)
            return

        invioInCorso = true

        if (to !== null) {
            clearTimeout(to)
            to = null
        }

        nome.innerText = ''
        badge.innerText = codice
        result.innerHTML = '<span class="wait">ATTENDI</span>'

        rilevazioni.unshift({
            nome: '',
            badge: codice,
            ora: Date.now(),
            stato: 2
        })

        disegna()

        invia(function () {
            disegna()

            invioInCorso = false

            to = setTimeout(ripristinaInterfaccia, 15000)
        })
    }

    var template = '<div class="box">' +
        '<div class="{classe}">{stato}</div>' +
        '<div>' +
        '<p>{nome}</p>\n' +
        '<p>{badgeEOra}</p>\n' +
        '</div>\n' +
        '</div>'

    function disegna () {
        var html = ''

        var max = rilevazioni.length > N_MAX_RILEVAZIONI_ELENCO ? N_MAX_RILEVAZIONI_ELENCO : rilevazioni.length

        for (var i = 0; i < max; i++) {
            var tmp = template

            var classe
            var stato

            if (rilevazioni[i].stato === 0) {
                classe = 'failed'
                stato = 'X'

            } else if (rilevazioni[i].stato === 1) {
                classe = 'ok'
                stato = 'OK'

            } else {
                classe = 'wait'
                stato = '?'
            }

            if (rilevazioni[i].nome === '') {

                tmp = tmp.replace('{nome}', rilevazioni[i].badge)
                tmp = tmp.replace('{classe}', classe)
                tmp = tmp.replace('{stato}', stato)
                tmp = tmp.replace('{badgeEOra}', new Date(rilevazioni[i].ora).toLocaleTimeString())

            } else {

                tmp = tmp.replace('{nome}', rilevazioni[i].nome)
                tmp = tmp.replace('{classe}', classe)
                tmp = tmp.replace('{stato}', stato)
                tmp = tmp.replace('{badgeEOra}', rilevazioni[i].badge + ' - ' + new Date(rilevazioni[i].ora).toLocaleTimeString())
            }

            html += tmp
        }

        ultimi.innerHTML = html
    }

    function invia (callback) {
        var rilevazione = rilevazioni[0]

        var xhr = new XMLHttpRequest()
        xhr.open('POST', '/totem/check', true)
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(JSON.stringify(rilevazione))

        xhr.onreadystatechange = function () {

            if (xhr.status === 200 && xhr.readyState === XMLHttpRequest.DONE) {

                var json = JSON.parse(xhr.responseText)

                rilevazioni[0] = json

                nome.innerText = json.nome
                badge.innerText = json.badge

                if (json.stato === 0)
                    result.innerHTML = '<span class="failed">ERRORE</span>'

                else
                    result.innerHTML = '<span class="ok">OK</span>'

                callback()
            } else if (xhr.readyState === XMLHttpRequest.DONE) {
                result.innerHTML = '<span class="failed">ERRORE</span>'
                rilevazioni[0].stato = 0
                callback()
            }
        }
    }

    function ripristinaInterfaccia () {

        to = null

        if(avvio)
            return

        nome.innerText = ''
        badge.innerText = ''
        result.innerHTML = '<span class="ok">AVVICINA IL BADGE AL LETTORE</span>'
    }

    function avvioTotem () {

        var xhr = new XMLHttpRequest()
        xhr.open('GET', '/totem/config', true)
        xhr.send()

        xhr.onreadystatechange = function () {

            if (xhr.status === 200 && xhr.readyState === XMLHttpRequest.DONE) {

                var json = JSON.parse(xhr.responseText)

                if (json.enabled === false) {
                    if (avvio === false)
                        avvio = true

                    nome.innerText = ''
                    badge.innerText = ''
                    result.innerHTML = '<span class="wait">TOTEM DISABILITATO</span>'

                } else if(avvio) {
                    avvio = false
                    ripristinaInterfaccia()
                }

                document.getElementById('marquee').innerText = json.marquee
            } else if (xhr.readyState === XMLHttpRequest.DONE) {

                if (avvio === false)
                    avvio = true

                nome.innerText = ''
                badge.innerText = ''
                result.innerHTML = '<span class="failed">DISCONNESSO</span>'
            }
        }

    }

    avvioTotem()
    setInterval(avvioTotem, 5000)
})