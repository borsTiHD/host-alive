import send from './pushover.js'
import resolveHostIp from './resolve-host-ip.js'
import pingIp from './ping-ip.js'
import wait from './wait.js'

// Repeating Mode
// Attempts to ping 'REPEAT' times and sends a report
export default async(settings) => {
    const remoteAdress = await resolveHostIp(settings.HOST)
    const reports = []

    // Attempts to ping 'REPEAT' times and sends a report
    for (let index = 0; index < settings.REPEAT; index++) {
        console.log('Ping:', index+1)
        const result = await pingIp(remoteAdress).catch((err) => {
            console.log(err)
        })
        reports.push(result)
        await wait(1000)
    }

    send({
        title: `Ping to ${settings.HOST}`,
        message: reports.join('\n')
    })
}
