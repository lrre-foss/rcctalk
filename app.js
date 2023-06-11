import chalk from "chalk"

import shell from "./shell.js"

const version = "1.0.0"

function start(options) {
    shell.open(options)
}

export default { version, start }