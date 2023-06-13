import readline from "node:readline"

import _eval from "eval"
import colorize from "json-colorizer"
import format from "string-format"
import ora from "ora"

import commands from "./commands.js"
import operations from "./operations.js"

import app from "../app.js"
import net from "../net.js"
import util from "../util.js"

const logo = "              _        _ _    " +
      "\n" + "             | |      | | |   " +
      "\n" + " _ __ ___ ___| |_ __ _| | | __" +
      "\n" + "| '__/ __/ __| __/ _` | | |/ /" +
      "\n" + "| | | (_| (__| || (_| | |   < " +
      "\n" + "|_|  \\___\\___|\\__\\__,_|_|_|\\_\\"

const io = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

function startup() {
    let lines = logo.split("\n")
    let colorIndex = 13 // CHANGEME if you change the logo

    for (let line of lines) {
        console.log(util.red(line.slice(0, colorIndex)) + util.white(line.slice(colorIndex)))
    }

    console.log(`Version ${util.yellow(app.version)}`)
    console.log(`${util.blue(app.url)}\n`)

    console.log(`Type ${util.cyan("help")} to get started`)
}

async function open(options) {
    startup()

    if (options.hasOwnProperty("connect")) {
        await commands.connect.handler([ options.connect ])
    }

    feed()
}

function evaluateParameters(parameters) {
    if (!parameters.length) {
        return []
    }

    return _eval(`const fs=require("fs");const path=require("path");module.exports=[${parameters}]`, "ExecuteScript", null, true)
}

async function feed() {
    io.question(`${net.isConnected() ? util.yellow(net.getFormattedHostname()) : ""}> `, async (input) => {
        input = input.trim()
        let method = ""

        for (let char of input) {
            if (char.match(/[a-z]/i)) {
                method += char
            } else {
                break
            }
        }

        if (commands.hasOwnProperty(method)) {
            if (commands[method].requiresConnection && !net.isConnected()) {
                console.log(`${util.red("Error:")} You must be connected to an RCCService instance to use this command!`)
                feed()
                return
            }

            if (commands[method].hasOwnProperty("parameters")) {
                let parameters = input.slice(method.length).trim().split(" ").filter(x => x)
                if (parameters.length != commands[method].parameters.length) {
                    console.log(`${util.red("Error:")} Invalid number of parameters. Type ${util.cyan("help")} for more information.`)
                    feed()
                    return
                }
                
                await commands[method].handler(parameters)
            } else {
                await commands[method].handler()
            }

            feed()
            return
        }

        if (operations.hasOwnProperty(method)) {
            if (!net.isConnected()) {
                console.log(`${util.red("Error:")} You must be connected to an RCCService instance to use an operation!`)
                feed()
                return
            }

            // Get the operation parameters
            let parameters = null

            if (operations[method].hasOwnProperty("parameters")) {
                try {
                    let thereafter = input.slice(method.length).trim()

                    if (thereafter.length < 2) {
                        throw "No parameters in input"
                    }

                    if (!thereafter.startsWith("(") || !thereafter.endsWith(")")) {
                        throw "Improperly formatted parameters; expected format: Operation(param1, param2, ...)"
                    }
                    
                    parameters = evaluateParameters(thereafter.slice(1, thereafter.length - 1))
                    if (!Array.isArray(parameters)) {
                        throw "Failed to evaluate parameters (not a valid array)"
                    }

                    if (parameters.length < Object.keys(operations[method].parameters).length) {
                        let values = Object.values(operations[method].parameters)
                        let required = 0

                        for (let i = 0; i < values.length; i++) {
                            if (values[i].required) {
                                required++
                            }
                        }

                        if (parameters.length < required) {
                            throw `Too few parameters (expected ${required}, got ${parameters.length})`
                        }

                        for (let i = 0; i < values.length; i++) {
                            if (!values[i].required && !parameters[i]) {
                                parameters[i] = values[i].default
                            }
                        }
                    }

                    let structured = {}
                    for (let i = 0; i < parameters.length; i++) {
                        structured[Object.keys(operations[method].parameters)[i]] = parameters[i]
                    }

                    parameters = structured
                } catch (e) {
                    console.log(`${util.red("Error:")} ${e}`)
                    feed()
                    return
                }
            }

            let spinner = ora(`Sending...`)
            spinner.start()

            let start = Date.now()
            let response = await operations[method].handler(parameters)
            let elapsed = Date.now() - start

            let error = net.fault()
            if (error) {
                spinner.fail(error)
                feed()
                return
            }

            let message = typeof response === "object" ? (response.hasOwnProperty("message") ? response.message : null) : null
            let data = typeof response === "object" ? response.data : response

            if (typeof data === "object" && data !== null) {
                message = format(`RCCService responded with the following data! (took ${util.green("{0}ms")})`, elapsed)

                spinner.succeed(message)
                console.log(colorize(data, { pretty: true }))
            } else if (data === null) {
                message = format(`Successfully ran operation in ${util.green("{0}ms")}!`, elapsed)
                spinner.succeed(message)
            } else {
                message = format(message === null ? `RCCService responded with "{0}" in ${util.green("{1}ms")}!` : message, data, elapsed)
                spinner.succeed(message)
            }

            feed()
            return
        }

        console.log(`${util.red("Error:")} Unrecognized command or operation. Type ${util.cyan("help")} for a list of available commands and operations.`)
        feed()
    })
}

export default { open }