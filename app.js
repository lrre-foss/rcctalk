const soap = require("./soap")
const chalk = require("chalk")

function displayLogo() {
    console.log(chalk.white("              _        _ _    "))
    console.log(chalk.white("             | |      | | |   "))
    console.log(chalk.red(" _ __ ___ ___") + chalk.white("| |_ __ _| | | __"))
    console.log(chalk.red("| '__/ __/ __") + chalk.white("| __/ _` | | |/ /"))
    console.log(chalk.red("| | | (_| (__") + chalk.white("| || (_| | |   < "))
    console.log(chalk.red("|_|  \\___\\___") + chalk.white("|\\__\\__,_|_|_|\\_\\"))
    console.log("version 1.0.0\n")
}

function start(options) {
    displayLogo()
}

module.exports = { start }