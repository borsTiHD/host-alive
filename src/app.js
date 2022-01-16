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

// Ping Wrapper
function pingIp(remoteAdress) {
    return new Promise((resolve, reject) => {
        const options = {
            retries: 3,
            timeout: 2000,
            packetSize: 64
        }
    
        // Create Session
        const session = ping.createSession(options)

        // Session Error Event
        session.on('error', (error) => {
            console.trace(error.toString())
        })
    
        // Session ping
        session.pingHost(remoteAdress, (error, target, sent, rcvd) => {
            const ms = rcvd - sent
            if (error) {
                if (error instanceof ping.RequestTimedOutError) {
                    console.log(`${target} : Not alive (ms=${ms})`)
                    reject(false)
                } else {
                    console.log(`${target} : ${error.toString()} (ms=${ms})`)
                    reject(false)
                }
            } else {
                console.log(`${target} : Alive (ms=${ms})`)
                resolve(true)
            }
        })
    })
}

// Waiting between pings
function wait(time){
    return new Promise((resolve) => {
        console.log('waiting...')
        setTimeout(resolve, time)
    })
}

// Main Function
async function main() {
    const remoteAdress = await getIpByHost(HOST)
    const array = [remoteAdress, remoteAdress, remoteAdress, remoteAdress]

    for (let index = 0; index < array.length; index++) {
        const adress = array[index]
        await pingIp(adress).catch((e) => {
            console.log(e)
        })
        wait(1000)
    }
}

// Starting...
await main()
