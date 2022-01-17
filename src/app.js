import dotenv from 'dotenv'
import send from './pushover.js'
import resolveHostIp from './resolve-host-ip.js'
import pingIp from './ping-ip.js'
import wait from './wait.js'

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

// Main Function
async function main() {
    const remoteAdress = await resolveHostIp(HOST)
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

    send({
        message: reports.join('\n'),
        title: 'Ping'
    })
}

// Starting...
await main()
