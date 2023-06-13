import readline from "node:readline"

import colorize from "json-colorizer"
import format from "string-format"
import ora from "ora"

import commands from "./commands.js"
import operations from "./operations.js"

import app from "../app.js"
import net from "../net.js"
import util from "../util.js"

// These modules are never used within this file, but we import them anyways so that users may easily access them from the shell.
import fs from "node:fs"
import path from "node:path"
import fetch from "node-fetch"

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
}

async function feed() {
    io.question(`${net.isConnected() ? util.yellow(net.getFormattedHostname()) : ""}> `, async (input) => {
        let method = ""

        for (let char of input) {
            if (char.match(/[a-z]/i)) {
                method += char
            } else {
                break
            }
        }

        if (method == "") {
            feed()
            return
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
            let parameters
            try {
                let thereafter = input.slice(method.length).trim()

                if (thereafter.length < 2) {
                    throw "No parameters in input"
                }

                if (!thereafter.startsWith("(") || !thereafter.endsWith(")")) {
                    throw "Improperly formatted parameters (one or more surrounding paranthesis missing); expected format: Operation(param1, param2, ...)"
                }

                parameters = evaluateParameters(thereafter.slice(1, thereafter.length - 1))
                if (parameters === null) {
                    throw `Failed to evaluate parameters: ${parameters}`
                }
            } catch (e) {
                console.log(`${util.red("Error:")} ${e}`)
                feed()
                return
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

            if (typeof data === "object") {
                message = format(`RCCService responded with the following data! (took ${util.green("{0}ms")})`, elapsed)

                spinner.succeed(message)
                console.log(colorize(data, { pretty: true }))
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