import http from 'http'

// Resolves IP Adress for given URL
export default (host) => {
    return new Promise((resolve, reject) => {
        http.get(host, function(res) {
            const remoteAdress = res.socket.remoteAddress
            console.log('Resolved IP Adress:', remoteAdress)
            resolve(remoteAdress)
        }).on('error', (e) => {
            console.error(`Got error: ${e.message}`)
            reject(e)
        })
    })
}
