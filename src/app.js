import http from 'http'
import ping from 'net-ping'
import dotenv from 'dotenv'
import moment from 'moment'
import Push from 'pushover-notifications'

// Loading '.env'
dotenv.config()

// Config
const isDev = process.env.NODE_ENV === 'development'
const REPEAT = process.env.REPEAT || 10
const CONTINOUS = process.env.CONTINOUS ? true : false
const HOST = process.env.HOST || 'http://www.google.de' // 'http://raspberrypi/'

// Push object
const notification = createPushover()

// Dev Check
if (isDev) {
    console.log('DEV Env:', isDev)
    if (CONTINOUS) {
        console.log('Pinging continually:', CONTINOUS)
    } else {
        console.log('Pinging multiple times:', REPEAT)
    }
}

// Resolves IP Adress for given URL
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

// Ping wrapper
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
            const receive = moment(new Date()).format('DD.MM.YY HH:mm:ss')
            if (error) {
                if (error instanceof ping.RequestTimedOutError) {
                    const report = `${receive} -> ${target} : Not alive (ms=${ms})`
                    console.log(report)
                    reject(report)
                } else {
                    const report = `${receive} -> ${target} : ${error.toString()} (ms=${ms})`
                    console.log(report)
                    reject(report)
                }
            } else {
                const report = `${receive} -> ${target} : Alive (ms=${ms})`
                console.log(report)
                resolve(report)
            }
        })
    })
}

// Pushing message through pushover
function createPushover() {
    const PUSHOVER_USER = process.env.PUSHOVER_USER || false
    const PUSHOVER_TOKEN = process.env.PUSHOVER_TOKEN || false
    if (PUSHOVER_USER && PUSHOVER_TOKEN) {
        return new Push( {
            user: PUSHOVER_USER,
            token: PUSHOVER_TOKEN
        })
    }
    return false
}

// Sending push notification through pushover
function sendNotification(msg) {
    if (notification) {
        notification.send(msg, (err, result) => {
            if (err) {
                console.error('Error on sending Push Notification:', err)
                throw err
            }
            console.log('Push Notification send:', result)
        })
    }
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
    const reports = []

    if (CONTINOUS) {
        let done = false
        let index = 0
        while (!done) {
            console.log('Ping:', index+1)
            index++
            const result = await pingIp(remoteAdress).catch((e) => {
                console.log(e)
            })
            reports.push(result)
            await wait(1000)
        }
    } else {
        for (let index = 0; index < REPEAT; index++) {
            console.log('Ping:', index+1)
            const result = await pingIp(remoteAdress).catch((e) => {
                console.log(e)
            })
            reports.push(result)
            await wait(1000)
        }
    }

    sendNotification({
        message: reports.join('\n'),
        title: 'Ping'
    })
}

// Starting...
await main()
