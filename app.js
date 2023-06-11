import chalk from "chalk"

import soap from "./soap.js"

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

// TODO: These chalk functions are disgusting but it's a good mockup for what it'll look like in the finished product.
// Refactor these later.
function displayOperations() {
    console.log(chalk.white("Available operations:"))
    console.log(`${chalk.grey("-")} ${chalk.blueBright("void")} ${chalk.yellowBright("OpenJob")}${chalk.whiteBright("(")}${chalk.redBright("string")} JobId, ${chalk.magentaBright("int?")} ExpirationInSeconds = ${chalk.cyanBright("300")}, ${chalk.magentaBright("int?")} Category = ${chalk.cyanBright("0")}, ${chalk.magentaBright("int?")} Cores = ${chalk.cyanBright("1")}, ${chalk.redBright("string")} Script, ${chalk.grey(`[... Arguments]`)}${chalk.whiteBright(")")}`)
    console.log(`${chalk.grey("-")} ${chalk.blueBright("void")} ${chalk.yellowBright("BatchJob")}${chalk.whiteBright("(")}${chalk.redBright("string")} JobId, ${chalk.magentaBright("int?")} ExpirationInSeconds = ${chalk.cyanBright("300")}, ${chalk.magentaBright("int?")} Category = ${chalk.cyanBright("0")}, ${chalk.magentaBright("int?")} Cores = ${chalk.cyanBright("1")}, ${chalk.redBright("string")} Script, ${chalk.grey("[... Arguments]")}${chalk.whiteBright(")")}`)
    console.log(`${chalk.grey("-")} ${chalk.blueBright("void")} ${chalk.yellowBright("CloseJob")}${chalk.whiteBright("(")}${chalk.redBright("string")} JobId${chalk.whiteBright(")")}`)
    console.log(`${chalk.grey("-")} ${chalk.blueBright("void")} ${chalk.yellowBright("CloseAllJobs")}${chalk.whiteBright("()")}`)
    console.log(`${chalk.grey("-")} ${chalk.blueBright("void")} ${chalk.yellowBright("CloseAllExpiredJobs")}${chalk.whiteBright("()")}`)
    console.log(`${chalk.grey("-")} ${chalk.blueBright("void")} ${chalk.yellowBright("RenewLease")}${chalk.whiteBright("(")}${chalk.redBright("string")} JobId, ${chalk.redBright("int")} ExpirationInSeconds${chalk.whiteBright(")")}`)
    console.log(`${chalk.grey("-")} ${chalk.blueBright("void")} ${chalk.yellowBright("GetExpiration")}${chalk.whiteBright("(")}${chalk.redBright("string")} JobId${chalk.whiteBright(")")}`)
    console.log(`${chalk.grey("-")} ${chalk.greenBright("ExecuteResult")} ${chalk.yellowBright("ExecuteScript")}${chalk.whiteBright("(")}${chalk.redBright("string")} JobId, ${chalk.redBright("string")} Script, ${chalk.grey("[... Arguments]")}${chalk.whiteBright(")")}`)
    console.log(`${chalk.grey("-")} ${chalk.greenBright("GetStatusResult")} ${chalk.yellowBright("GetStatus")}${chalk.whiteBright("()")}`)
    console.log(`${chalk.grey("-")} ${chalk.greenBright("DiagResult")} ${chalk.yellowBright("Diag")}${chalk.whiteBright("(")}${chalk.redBright("int")} Type, ${chalk.redBright("string")} JobId${chalk.whiteBright(")")}`)
    console.log()
}

function displayCommands() {
    console.log(chalk.white("Available commands:"))
    console.log(`${chalk.grey("-")} ${chalk.whiteBright("connect <ip>")} - connects to a different RCCService instance`)
    console.log(`${chalk.grey("-")} ${chalk.whiteBright("disconnect")} - disconnects from the current RCCService instance`)
    console.log(`${chalk.grey("-")} ${chalk.whiteBright("version")} - output the version number of the connected RCCService instance`)
    console.log(`${chalk.grey("-")} ${chalk.whiteBright("ping")} - pings the connected RCCService instance`)
    console.log(`${chalk.grey("-")} ${chalk.whiteBright("help")} - displays this help message`)
    console.log(`${chalk.grey("-")} ${chalk.whiteBright("operations")} - displays all available operations`)
    console.log(`${chalk.grey("-")} ${chalk.whiteBright("commands")} - displays all available commands`)
    console.log(`${chalk.grey("-")} ${chalk.whiteBright("exit")} - closes rcctalk`)
    console.log()
}

function start(options) {
    displayLogo()
    displayOperations()
    displayCommands()
}

export default { version, start }