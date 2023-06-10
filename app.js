import chalk from "chalk"

import soap from "./soap.js"

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
}

function displayCommands() {
    console.log(chalk.white("Available commands:"))
    console.log(`${chalk.grey("-")} ${chalk.whiteBright("connect <ip>")} - connects to a different RCCService instance`)
    console.log(`${chalk.grey("-")} ${chalk.whiteBright("operations")} - displays all available operations`)
    console.log(`${chalk.grey("-")} ${chalk.whiteBright("version")} - output the version number`)
    console.log(`${chalk.grey("-")} ${chalk.whiteBright("exit")} - closes rcctalk`)
}

function displayLogo() {
    console.log(`${chalk.white("              _        _ _    ")}`)
    console.log(`${chalk.white("             | |      | | |   ")}`)
    console.log(`${chalk.redBright(" _ __ ___ ___")}${chalk.white("| |_ __ _| | | __")}`)
    console.log(`${chalk.redBright("| '__/ __/ __")}${chalk.white("| __/ _` | | |/ /")}`)
    console.log(`${chalk.redBright("| | | (_| (__")}${chalk.white("| || (_| | |   < ")}`)
    console.log(`${chalk.redBright("|_|  \\___\\___")}${chalk.white("|\\__\\__,_|_|_|\\_\\")}`)
    console.log("version 1.0.0\n")
}

function start(options) {
    if (options.operations) {
        displayOperations()
        return
    }

    displayLogo()
}

export default { start }