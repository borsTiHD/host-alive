import ping from 'net-ping'
import moment from 'moment'

// Pings given IP-Adress and returns promise
export default (remoteAdress) => {
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
