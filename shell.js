import fs from "node:fs"
import readline from "node:readline"

import chalk from "chalk"
import colorize from "json-colorizer"
import ora from "ora"
import { v4 as uuid } from "uuid"

import app from "./app.js"
import soap from "./soap.js"

// Quickly access chalk functions @_@
const c = {
    r: chalk.redBright,
    g: chalk.greenBright,
    y: chalk.yellowBright,
    m: chalk.magentaBright,
    c: chalk.cyanBright,
    w: chalk.whiteBright,
    b: chalk.blueBright,
    gr: chalk.grey
}

const logo = "              _        _ _    " +
      "\n" + "             | |      | | |   " +
      "\n" + " _ __ ___ ___| |_ __ _| | | __" +
      "\n" + "| '__/ __/ __| __/ _` | | |/ /" +
      "\n" + "| | | (_| (__| || (_| | |   < " +
      "\n" + "|_|  \\___\\___|\\__\\__,_|_|_|\\_\\"
const colorIndex = 13

const commands = {
    "connect": {
        description: "connect to a RCCService instance at the specified IP address (default port: 64989)",
        parameters: ["ip"],
        handler: async (ip) => {
            soap.disconnect()

            ip = soap.sanitize(ip)

            if (ip === null) {
                console.log(c.r("Invalid IP address!"))
                return
            }
            
            let spinner = ora({
                text: `Connecting to ${c.y(ip)}`,
                spinner: "simpleDotsScrolling"
            })

            spinner.start()

            let start = Date.now()
            await soap.connect(ip)
            let elapsed = Date.now() - start
            
            spinner.suffixText = soap.fault(false) ? `${c.r("Error!")}` : `Connected! (took ${c.g(elapsed + "ms")})`
            spinner.stop()
            soap.error()

            if (!soap.fault()) {
                spinner.suffixText = `Connected! (took ${c.g(elapsed + "ms")})`
            }

            io.setPrompt(c.y(soap.getIP()))
        }
    },
    "disconnect": {
        description: "disconnects from the connected RCCService instance",
        handler: () => {
            soap.disconnect()
            io.setPrompt("")
        }
    },
    "version": {
        description: "prints the version number of the connected RCCService instance",
        handler: async () => {
            let response = await soap.send([{
                "GetVersion": {}
            }])

            if (!soap.fault()) {
                console.log(`Connected to RCCService version ${response}`)
            }
        }
    },
    "ping": {
        description: "pings the connected RCCService instance",
        handler: async () => {
            let start = Date.now()
            let response = await soap.send([{
                "HelloWorld": {}
            }])
            let elapsed = Date.now() - start

            if (!soap.fault()) {
                console.log(`Pong! (RCCService returned "${response}" in ${c.g(`${elapsed}ms`)})`)
            }
        }
    },
    "help": {
        description: "displays all available operations and commands",
        handler: () => {
            commands.commands.handler()
            console.log()
            commands.operations.handler()
        }
    },
    "operations": {
        description: "displays all available operations",
        handler: () => {
            console.log(c.w("Available operations:"))

            for (let name in operations) {
                let operation = operations[name]

                process.stdout.write(`${c.gr("-")} `)

                // Operation type
                if (typeof operation.returns !== "object") {
                    process.stdout.write(`${c.b(operation.returns)}`)
                } else {
                    let type = operation.returns.type
                    
                    if (type.includes("[]")) {
                        process.stdout.write(`${c.g(type.replace("[]", ""))}${c.w("[]")}`)
                    } else {
                        process.stdout.write(`${c.g(type)}`)
                    }
                }

                // Operation name
                process.stdout.write(` ${c.y(name)}(`)

                // Operation parameters
                if (!operation.hasOwnProperty("parameters")) {
                    console.log(")")
                } else {
                    let i = 0
                    for (let name in operation.parameters) {
                        let parameter = operation.parameters[name]

                        // Parameter type & name
                        if (parameter.type.includes("|")) {
                            let types = parameter.type.split("|")
                            process.stdout.write(`${c.r(types[0])}${c.gr("|")}${c.r(types[1])}`)
                        } else {
                            process.stdout.write(`${c.r(parameter.type)}`)
                        }

                        if (parameter.required) {
                            process.stdout.write(` ${c.w(name)}`)
                        } else {
                            process.stdout.write(`${c.m("?")} ${c.w(name)}`)

                            if (parameter.hasOwnProperty("default")) {
                                process.stdout.write(` = ${typeof parameter.default === "object" ? c.w("[]") : c.c(parameter.default)}`)
                            }
                        }

                        if (i == Object.keys(operation.parameters).length - 1) {
                            console.log(")")
                        } else {
                            process.stdout.write(", ")
                        }

                        i++
                    }
                }
            }
        }
    },
    "commands": {
        description: "displays all available commands",
        handler: () => {
            console.log(c.w("Available commands:"))

            for (let name in commands) {
                let command = commands[name]

                // Command name
                process.stdout.write(`${c.gr("-")} ${c.w(name)}`)

                // Parameters
                if (command.hasOwnProperty("parameters")) {
                    for (let parameter of command.parameters) {
                        process.stdout.write(` ${c.c(`<${parameter}>`)}`)
                    }
                }

                // Command description
                console.log(` - ${command.description}`)
            }
        }
    },
    "exit": {
        description: "closes rcctalk",
        handler: () => {
            process.exit(0)
        }
    }
}

const operations = {
    "HelloWorld": {
        returns: "string",
        handler: async () => {
            let response = await soap.send([{
                "HelloWorld": {}
            }])

            if (!soap.fault()) {
                console.log(response)
            }
        }
    },
    "GetVersion": {
        returns: "string",
        handler: async () => {
            let response = await soap.send([{
                "GetVersion": {}
            }])

            if (!soap.fault()) {
                console.log(response)
            }
        }
    },
    "GetStatus": {
        returns: {
            userdata: true,
            type: "Status",
        },
        handler: async () => {
            let response = await soap.send([{
                "Status": {}
            }])

            if (!soap.fault()) {
                console.log(colorize(response, { pretty: true }))
            }
        }
    },
    "OpenJob": {
        returns: {
            userdata: true,
            type: "LuaValue[]",
        },
        parameters: {
            "jobID": {
                type: "string",
                required: true
            },
            "expirationInSeconds": {
                type: "double",
                required: false,
                default: 300.0
            },
            "category": {
                type: "int",
                required: false,
                default: 0
            },
            "cores": {
                type: "int",
                required: false,
                default: 1
            },
            "script": {
                type: "string|filepath",
                required: true
            },
            "arguments": {
                type: "array",
                required: false,
                default: []
            }
        },
        handler: async (jobID, expirationInSeconds, category, cores, script, data) => {
            if (fs.existsSync(script)) {
                script = fs.readFileSync(script, "utf8")
            }

            let response = await soap.send([{
                "OpenJob": {
                    "job": {
                        "id": jobID,
                        "expirationInSeconds": expirationInSeconds,
                        "category": category,
                        "cores": cores
                    },
                    
                    "script": {
                        "name": "Starter Script",
                        "script": script,
                        "arguments": data
                    }
                }
            }])

            if (!soap.fault()) {
                console.log(colorize(response, { pretty: true }))
            }
        }
    },
    "RenewLease": {
        returns: "double",
        parameters: {
            "jobID": {
                type: "string",
                required: true
            },
            "expirationInSeconds": {
                type: "double",
                required: true
            }
        },
        handler: async (jobID, expirationInSeconds) => {
            let response = await soap.send([{
                "RenewLease": {
                    "jobID": jobID,
                    "expirationInSeconds": expirationInSeconds
                }
            }])

            if (!soap.fault()) {
                console.log(response)
            }
        }
    },
    "Execute": {
        returns: {
            userdata: true,
            type: "LuaValue[]",
        },
        parameters: {
            "jobID": {
                type: "string",
                required: true
            },
            "script": {
                type: "string|filepath",
                required: true
            },
            "arguments": {
                type: "array",
                required: false,
                default: []
            }
        },
        handler: async (jobID, script, data) => {
            if (script == basename(script) && fs.existsSync(script)) {
                script = fs.readFileSync(script, "utf8")
            }

            let response = await soap.send([{
                "Execute": {
                    "jobID": jobID,
                    "script": {
                        "name": uuid(),
                        "script": script,
                        "arguments": data
                    }
                }
            }])

            if (!soap.fault()) {
                console.log(colorize(response, { pretty: true }))
            }
        }
    },
    "CloseJob": {
        returns: "void",
        parameters: {
            "jobID": {
                type: "string",
                required: true
            },
        },
        handler: async (jobID) => {
            await soap.send([{
                "CloseJob": {
                    "jobID": jobID
                }
            }])

            if (!soap.fault()) {
                console.log(`Successfully closed job with ID "${jobID}"`)
            }
        }
    },
    "BatchJob": {
        returns: {
            userdata: true,
            type: "LuaValue[]",
        },
        parameters: {
            "jobID": {
                type: "string",
                required: true
            },
            "expirationInSeconds": {
                type: "double",
                required: false,
                default: 300.0
            },
            "category": {
                type: "int",
                required: false,
                default: 0
            },
            "cores": {
                type: "int",
                required: false,
                default: 1
            },
            "script": {
                type: "string|filepath",
                required: true
            },
            "arguments": {
                type: "array",
                required: false,
                default: []
            }
        },
        handler: async (jobID, expirationInSeconds, category, cores, script, data) => {
            if (script == basename(script) && fs.existsSync(script)) {
                script = fs.readFileSync(script, "utf8")
            }

            let response = await soap.send([{
                "OpenJob": {
                    "job": {
                        "id": jobID,
                        "expirationInSeconds": expirationInSeconds,
                        "category": category,
                        "cores": cores
                    },
                    
                    "script": {
                        "name": "Starter Script",
                        "script": script,
                        "arguments": data
                    }
                }
            }])

            if (!soap.fault()) {
                console.log(colorize(response, { pretty: true }))
            }
        }
    },
    "GetExpiration": {
        returns: "double",
        parameters: {
            "jobID": {
                type: "string",
                required: true
            },
        },
        handler: async () => {
            let response = await soap.send([{
                "GetExpiration": {
                    "jobID": jobID
                }
            }])

            if (!soap.fault()) {
                console.log(response)
            }
        }
    },
    "GetAllJobs": {
        returns: {
            userdata: true,
            type: "Job[]"
        },
        handler: async () => {
            let response = await soap.send([{
                "GetAllJobs": {}
            }])

            if (!soap.fault()) {
                console.log(colorize(response, { pretty: true }))
            }
        }
    },
    "CloseExpiredJobs": {
        returns: "int",
        handler: async () => {
            let response = await soap.send([{
                "CloseExpiredJobs": {}
            }])

            if (!soap.fault()) {
                console.log(response)
            }
        }
    },
    "Diag": {
        returns: {
            userdata: true,
            type: "LuaValue[]"
        },
        parameters: {
            "type": {
                type: "int",
                required: true
            },
            "jobID": {
                type: "string",
                required: false
            }
        },
        handler: async (type, jobID) => {
            let response = await soap.send([{
                "Diag": {
                    "type": type,
                    "jobID": jobID
                }
            }])

            if (!soap.fault()) {
                console.log(colorize(response, { pretty: true }))
            }
        }
    }
}

const io = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> "
})

function startup() {
    let lines = logo.split("\n")
    for (let line of lines) {
        console.log(c.r(line.slice(0, colorIndex)) + c.w(line.slice(colorIndex)))
    }

    console.log(`version ${app.version}\n`)
    console.log(`Type ${c.y("help")} to get started`)
}

async function open(options) {
    startup()

    if (options.hasOwnProperty("connect")) {
        await commands.connect.handler(options.connect)
    }

    feed()
}

function feed() {
    io.question("> ", async (input) => {
        if (input == "help") {
            commands.help.handler()
        } else if (input == "exit") {
            commands.exit.handler()
        }

        feed()
    })
}

export default { open }