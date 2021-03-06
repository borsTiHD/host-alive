import dotenv from 'dotenv'
import modeContinous from './mode-continous.js'
import modeRepeating from './mode-repeating.js'

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
const MONITORING_PERIOD = 1 // In minutes -> Time period that is monitored before the counter is reset
const WAITING_ON_ERROR = 1000 * 60 * 15 // In seconds - 15 min -> Waiting time after sending an error report before trying to ping again

// Dev Check
if (isDev) {
    console.log('DEV Env:', isDev)
    if (CONTINOUS) {
        console.log('Pinging continually:', CONTINOUS)
    } else {
        console.log('Pinging multiple times:', REPEAT)
    }
}

function exitHandler(eventType, exitCode) {
    console.log('Event:', eventType)
    console.log('Exitcode:', exitCode)
    if (exitCode === 'SIGINT') {
        process.exitCode = 1
        // process.exit()
    }
}

['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM'].forEach((eventType) => {
    process.on(eventType, exitHandler.bind(null, eventType))
})

// Starting...
if (CONTINOUS) {
    // Continous Mode
    // Pinging continous until...
    await modeContinous({ isDev, HOST, MAX_LOSS, MAX_REPORTS, MONITORING_PERIOD, WAITING_ON_ERROR })
} else {
    // Repeating Mode
    // Attempts to ping 'REPEAT' times and sends a report
    modeRepeating({ isDev, REPEAT, HOST })
}
