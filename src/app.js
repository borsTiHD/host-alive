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
const MAX_REPORTS = 10 // How many reports should be send
const MONITORING_PERIOD = 1000 * 60 * 15 // 15 min -> Time period that is monitored before the counter is reset.
const WAITING_ON_ERROR = 1000 * 60 * 15 // 15 min -> Waiting time after sending an error report before trying to ping again

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
    // Continous Mode
    // Pinging continous until...
    modeContinous({ isDev, HOST, MAX_LOSS, MAX_REPORTS, MONITORING_PERIOD, WAITING_ON_ERROR })
} else {
    // Repeating Mode
    // Attempts to ping 'REPEAT' times and sends a report
    modeRepeating({ isDev, REPEAT, HOST })
}
