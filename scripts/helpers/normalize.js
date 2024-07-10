
module.exports = function normalize(str) {
    str = str.replaceAll(/\[.*\]/g, "")
    str = str.trim()
    return str
}