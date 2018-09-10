window.addEventListener('load', function () {

    var caricamento = document.getElementById('caricamento')
    var abilitato = document.getElementById('abilitato')
    var endpoint = document.getElementById('endpoint')
    var eseguibile = document.getElementById('eseguibileChromium')
    var token = document.getElementById('token')
    var messaggio = document.getElementById('messaggio')
    var form = document.getElementById('form')

    var salvataggio = true

    richiedi()

    function richiedi () {

        var xhr = new XMLHttpRequest()
        xhr.open('GET', '/gestione/get', true)
        xhr.send()

        xhr.onreadystatechange = function () {

            if (xhr.status === 200 && xhr.readyState === XMLHttpRequest.DONE) {

                var json = JSON.parse(xhr.responseText)

                caricamento.style.display = 'none'
                token.value = json.token
                eseguibile.value = json.startCommand
                messaggio.value = json.marquee
                abilitato.checked = json.enabled
                endpoint.value = json.endpoint

            } else if (xhr.readyState === XMLHttpRequest.DONE) {
                result.innerHTML = '<span class="failed">ERRORE</span>'
                rilevazioni[0].stato = 0
                callback()
            }
        }
    }

    form.addEventListener('submit', invia)

    function invia (e) {

        e.preventDefault()

        var dati = {
            endpoint: endpoint.value,
            enabled: abilitato.checked,
            token: token.value,
            marquee: messaggio.value,
            startCommand: eseguibile.value
        }

        var xhr = new XMLHttpRequest()
        xhr.open('POST', '/gestione/set', true)
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(JSON.stringify(dati))

        xhr.onreadystatechange = function () {

            if (xhr.status === 200 && xhr.readyState === XMLHttpRequest.DONE) {
                alert('Salvato')

            } else if (xhr.readyState === XMLHttpRequest.DONE) {
                alert('Errore')
            }
        }
    }
})