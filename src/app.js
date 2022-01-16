import http from 'http'
import ping from 'net-ping'

// Config
const isDev = process.env.NODE_ENV === 'development'
const HOST = 'http://www.google.de'

// Dev Check
if (isDev) {
    console.log('DEV Env:', isDev)
}

// Returns Promise
// Resolves IP Adress of URL
function getIpByHost(host) {
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

// Main Function
async function main() {
    const remoteAdress = await getIpByHost(HOST)
    const session = ping.createSession()
    session.pingHost(remoteAdress, (error, target) => {
        if (error) {
            console.log(target + ': ' + error.toString ())
        } else {
            console.log(target + ': Alive')
        }
    })
}

// Starting...
main()
