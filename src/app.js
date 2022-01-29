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

// Settings for continous mode
const MAX_LOSS = 2 // How many pings can be lossed before sending a report (only in continous mode)
const MAX_REPORTS = 60 // How many reports should be send
const MONITORING_PERIOD = 1000 * 60 * 15 // 15 min -> Time period that is monitored before the counter is reset.
const WAITING_ON_ERROR = 1000 * 60 * 15 // 15 min -> Waiting time after sending an error report before trying to ping again

// Main Function - Continous Mode
// Pinging continous until...
async function continousMode() {
    const remoteAdress = await resolveHostIp(HOST)
    const reports = []

    let done = false
    let index = 0
    let losses = 0 // Loss counter -> a report is sent only when a sufficient number ('MAX_LOSS') has been counted up

    // Time period that is monitored before the counter is reset. Within the period of time errors are counted.
    // If the error counter exceeds a set value ('MAX_LOSS'), a report is sent and then an adjustable value ('WAITING_ON_ERROR') is waited for before checking again.
    const interval = setInterval(() => {
        losses = 0
    }, MONITORING_PERIOD)

    while (!done && interval) {
        console.log('Ping:', index+1)
        index++
        const result = await pingIp(remoteAdress).then((result) => {
            // if (losses > 0) { losses-- } // Successfull pings reduce the 'loss' counter
            return result
        }).catch((err) => {
            losses++ // Unsuccessful pings increase the counter
            return err
        })
        reports.push(result)
        if (losses > MAX_LOSS) {
            losses = 0 // Set 'loss' counter back to 0 to pretend spamming
            if (reports.length > MAX_REPORTS) { // Reducing reports to max allowed
                reports.splice(0, reports.length - MAX_REPORTS)
            }
            send({
                title: `Ping to ${HOST} failed`,
                message: reports.join('\n')
            })
            await wait(WAITING_ON_ERROR)
        }
        await wait(1000)
    }

    send({
        title: `WARNING - ${HOST}`,
        message: 'Repeated pinging was stopped...'
    })
}

// Main Function - Repeating Mode
// Attempts to ping 'REPEAT' times and sends a report
async function repeatingMode() {
    const remoteAdress = await resolveHostIp(HOST)
    const reports = []

    // Attempts to ping 'REPEAT' times and sends a report
    for (let index = 0; index < REPEAT; index++) {
        console.log('Ping:', index+1)
        const result = await pingIp(remoteAdress).catch((err) => {
            console.log(err)
        })
        reports.push(result)
        await wait(1000)
    }

    send({
        title: `Ping to ${HOST}`,
        message: reports.join('\n')
    })
}

// Dev Check
if (isDev) {
    console.log('DEV Env:', isDev)
    if (CONTINOUS) {
        console.log('Pinging continually:', CONTINOUS)
    } else {
        console.log('Pinging multiple times:', REPEAT)
    }
}

// Starting...
if (CONTINOUS) {
    continousMode()
} else {
    repeatingMode()
}
