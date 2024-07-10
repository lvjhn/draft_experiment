
module.exports = function headerMap(headers) {
    const headerMap = {}
    let i = 0  
    for(let header of headers) {
        headerMap[header] = i
        i += 1
    }
    return headerMap
}