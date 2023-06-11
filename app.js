import chalk from "chalk"

import shell from "./shell.js"

const version = "1.0.0"
const logo = "              _        _ _    " +
      "\n" + "             | |      | | |   " +
      "\n" + " _ __ ___ ___| |_ __ _| | | __" +
      "\n" + "| '__/ __/ __| __/ _` | | |/ /" +
      "\n" + "| | | (_| (__| || (_| | |   < " +
      "\n" + "|_|  \\___\\___|\\__\\__,_|_|_|\\_\\"

function displayLogo() {
    let lines = logo.split("\n")
    for (let line of lines) {
        console.log(chalk.redBright(line.slice(0, 13)) + chalk.whiteBright(line.slice(13)))
    }

    console.log(`version ${version}\n`)
}

function start(options) {
    displayLogo()
}

export default { version, start }