import chalk from "chalk"

import soap from "./soap.js"

function displayOperations() {
    console.log(chalk.white("Available operations:"))
    console.log(`${chalk.grey("-")} ${chalk.blueBright("void")} ${chalk.yellowBright("OpenJob")}${chalk.grey("(")}${chalk.redBright("string")} JobId, ${chalk.magentaBright("int?")} ExpirationInSeconds = ${chalk.cyanBright("300")}, ${chalk.magentaBright("int?")} Category = ${chalk.cyanBright("0")}, ${chalk.magentaBright("int?")} Cores = ${chalk.cyanBright("1")}, ${chalk.redBright("string")} Script, ${chalk.grey(`[... Arguments]`)}${chalk.grey(")")}`)
    console.log(`${chalk.grey("-")} ${chalk.blueBright("void")} ${chalk.yellowBright("BatchJob")}${chalk.grey("(")}${chalk.redBright("string")} JobId, ${chalk.magentaBright("int?")} ExpirationInSeconds = ${chalk.cyanBright("300")}, ${chalk.magentaBright("int?")} Category = ${chalk.cyanBright("0")}, ${chalk.magentaBright("int?")} Cores = ${chalk.cyanBright("1")}, ${chalk.redBright("string")} Script, ${chalk.grey("[... Arguments]")}${chalk.grey(")")}`)
    console.log(`${chalk.grey("-")} ${chalk.blueBright("void")} ${chalk.yellowBright("CloseJob")}${chalk.grey("(")}${chalk.redBright("string")} JobId${chalk.grey(")")}`)
    console.log(`${chalk.grey("-")} ${chalk.blueBright("void")} ${chalk.yellowBright("CloseAllJobs")}${chalk.grey("()")}`)
    console.log(`${chalk.grey("-")} ${chalk.blueBright("void")} ${chalk.yellowBright("CloseAllExpiredBrightJobs")}${chalk.grey("()")}`)
    console.log(`${chalk.grey("-")} ${chalk.blueBright("void")} ${chalk.yellowBright("RenewLease")}${chalk.grey("(")}${chalk.redBright("string")} JobId, int ExpirationInSeconds${chalk.grey(")")}`)
    console.log(`${chalk.grey("-")} ${chalk.blueBright("void")} ${chalk.yellowBright("GetExpiration")}${chalk.grey("(")}${chalk.redBright("string")} JobId${chalk.grey(")")}`)
    console.log(`${chalk.grey("-")} ${chalk.greenBright("ExecuteResult")} ${chalk.yellowBright("ExecuteScript")}${chalk.grey("(")}${chalk.redBright("string")} JobId, ${chalk.redBright("string")} Script, ${chalk.grey("[... Arguments]")}${chalk.grey(")")}`)
    console.log(`${chalk.grey("-")} ${chalk.greenBright("GetStatusResult")} ${chalk.yellowBright("GetStatus")}${chalk.grey("()")}`)
    console.log(`${chalk.grey("-")} ${chalk.greenBright("DiagResult")} ${chalk.yellowBright("Diag")}${chalk.grey("(")}${chalk.redBright("int")} Type, ${chalk.redBright("string")} JobId${chalk.grey(")")}`)
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