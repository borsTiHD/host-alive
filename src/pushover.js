import dotenv from 'dotenv'
import Push from 'pushover-notifications'

// Loading '.env'
dotenv.config()

// Push object
const notification = createPushover()

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

export default (msg) => {
    if (notification) {
        notification.send(msg, (err, result) => {
            if (err) {
                console.error('Error on sending Push Notification:', err)
                throw err
            }
            console.log('Push Notification send:', result)
        })
    } else {
        console.warn('No Pushover object was created.')
    }
}
