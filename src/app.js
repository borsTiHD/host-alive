import http from 'http'
import ping from 'net-ping'
import dotenv from 'dotenv'

// Loading '.env'
dotenv.config()

// Config
const isDev = process.env.NODE_ENV === 'development'
const REPEAT = process.env.REPEAT || 10
const CONTINOUS = process.env.CONTINOUS ? true : false
const HOST = process.env.HOST || 'http://www.google.de' // 'http://raspberrypi/'

// Dev Check
if (isDev) {
    console.log('DEV Env:', isDev)
    if (CONTINOUS) {
        console.log('Pinging continually:', CONTINOUS)
    } else {
        console.log('Pinging multiple times:', REPEAT)
    }
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
            retries: 1,
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
        console.log('*')
        setTimeout(resolve, time)
    })
}

// Main Function
async function main() {
    const remoteAdress = await getIpByHost(HOST)

    if (CONTINOUS) {
        let done = false
        let index = 0
        while (!done) {
            console.log('Ping:', index+1)
            index++
            await pingIp(remoteAdress).catch((e) => {
                console.log(e)
            })
            await wait(1000)
        }
    } else {
        for (let index = 0; index < REPEAT; index++) {
            console.log('Ping:', index+1)
            await pingIp(remoteAdress).catch((e) => {
                console.log(e)
            })
            await wait(1000)
        }
    }
}

// Starting...
await main()
