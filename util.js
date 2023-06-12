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
    colorized += `${white(name)}`

    // Parameters
    if (data.hasOwnProperty("parameters")) {
        for (let parameter of data.parameters) {
            colorized += " "
            colorized += `${cyan(`<${parameter}>`)}`
        }
    }

    return colorized
}

function colorizeOperation(name, data) {
    let colorized = ""

    // Operation type
    if (typeof data.returns !== "object") {
        colorized += `${blue(operation.returns)}`
    } else {
        let type = operation.returns.type
        colorized += type.includes("[]") ? `${green(type.replace("[]", "")) + white("[]")}` : `${green(type)}`

        if (operation.returns.hasOwnProperty("required")) {
            colorized += `${magenta(operation.returns.required ? "" : "?")}`
        }
    }

    // Operation name
    colorized += " "
    colorized += yellow(name)

    // Operation parameters
    colorized += "("

    if (!operation.hasOwnProperty("parameters")) {
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

        if (index == Object.keys(operation.parameters).length - 1) {
            colorized += ")"
        } else {
            colorized += ", "
        }

        index++
    }

    return colorized
}

export default {
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