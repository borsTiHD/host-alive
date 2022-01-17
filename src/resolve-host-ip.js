import http from 'http'
import testIpAdress from './regex-ipv4-ipv6.js'

// Resolves IP Adress for given URL
export default (host) => {
    // Test if given host is a IP-Adress or a host
    // IPv4/IPv6 Adresses returning directly
    if (testIpAdress(host)) { return host }
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
