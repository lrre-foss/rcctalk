import shell from "./shell/index.js"

const version = "1.0.0"
const url = "https://github.com/lrre-foss/rcctalk"

function start(options) {
    shell.open(options)
}

export default { version, url, start }