import send from './pushover.js'
import resolveHostIp from './resolve-host-ip.js'
import pingIp from './ping-ip.js'
import wait from './wait.js'

// Continous Mode
// Pinging continous until...
export default async(settings) => {
    const remoteAdress = await resolveHostIp(settings.HOST)
    const reports = []

    let done = false
    let index = 0
    let losses = 0 // Loss counter -> a report is sent only when a sufficient number ('MAX_LOSS') has been counted up

    // Time period that is monitored before the counter resets. Within the period errors are counted.
    // If the error counter exceeds a set value ('MAX_LOSS'), a report is sent and then an adjustable value ('WAITING_ON_ERROR') is waited for before checking again.
    const monitor = setInterval(() => {
        losses = 0
    }, settings.MONITORING_PERIOD)

    while (!done && monitor) {
        console.log('Ping:', index+1)
        index++
        const result = await pingIp(remoteAdress).catch((err) => {
            losses++ // Unsuccessful pings increase the counter
            return err
        })
        reports.push(result)
        if (losses > settings.MAX_LOSS || index > 50) {
            losses = 0 // Set 'loss' counter back to 0 to pretend spamming
            if (reports.length > settings.MAX_REPORTS) { // Reducing reports to max allowed
                reports.splice(0, reports.length - settings.MAX_REPORTS)
            }
            send({
                title: `Ping to ${settings.HOST} failed`,
                message: reports.join('\n')
            })
            await wait(settings.WAITING_ON_ERROR)
        }
        await wait(1000)
    }

    send({
        title: `WARNING - ${settings.HOST}`,
        message: 'Repeated pinging was stopped...'
    })
}
