import chalk from "chalk"

// Chalk shorthands
const red = chalk.redBright
const green = chalk.greenBright
const yellow = chalk.yellowBright
const blue = chalk.blueBright
const magenta = chalk.magentaBright
const cyan = chalk.cyanBright
const white = chalk.whiteBright
const grey = chalk.grey

function colorizeCommand(name, data) {
    let colorized = ""

    // Command name
    colorized += `${cyan(name)}`

    // Parameters
    if (data.hasOwnProperty("parameters")) {
        for (let parameter of data.parameters) {
            colorized += " "
            colorized += `${white(`<${parameter}>`)}`
        }
    }

    return colorized
}

function colorizeOperation(name, data) {
    let colorized = ""

    // Operation type
    if (typeof data.returns !== "object") {
        colorized += `${blue(data.returns)}`
    } else {
        let type = data.returns.type
        colorized += type.includes("[]") ? `${green(type.replace("[]", "")) + white("[]")}` : `${green(type)}`

        if (data.returns.hasOwnProperty("required")) {
            colorized += `${magenta(data.returns.required ? "" : "?")}`
        }
    }

    // Operation name
    colorized += " "
    colorized += yellow(name)

    // Operation parameters
    colorized += "("

    if (!data.hasOwnProperty("parameters")) {
        colorized += ")"
        return colorized
    }

    let index = 0
    for (let name in data.parameters) {
        let parameter = data.parameters[name]

        // Parameter type & name
        if (parameter.required) {
            colorized += `${red(parameter.type)} ${white(name)}`
        } else {
            colorized += `${red(parameter.type) + magenta("?")} ${white(name)}`
            
            if (parameter.hasOwnProperty("default")) {
                colorized += " = "
                colorized += typeof parameter.default === "object" ? white("[]") : cyan(parameter.default)
            }
        }

        if (index == Object.keys(data.parameters).length - 1) {
            colorized += ")"
        } else {
            colorized += ", "
        }

        index++
    }

    return colorized
}

function setTerminalTitle(title) {
    if (process.platform == 'win32') {
        process.title = title;
    } else {
        process.stdout.write('\x1b]2;' + title + '\x1b\x5c');
    }
}

export default {
    setTerminalTitle,
    colorizeCommand,
    colorizeOperation,

    red,
    green,
    yellow,
    blue,
    magenta,
    cyan,
    white,
    grey
}