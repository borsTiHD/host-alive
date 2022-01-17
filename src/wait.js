export default (time) => {
    return new Promise((resolve) => {
        console.log('*')
        setTimeout(resolve, time)
    })
}
