import fs from "node:fs"
import readline from "node:readline"

import colorize from "json-colorizer"
import ora from "ora"
import { v4 as uuid } from "uuid"

import c from "./chalk.js"
import app from "./app.js"
import soap from "./soap.js"

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
            ip = soap.sanitize(ip)

            if (ip === null) {
                console.log(`${c.r("Invalid IP address!")} Please pass a valid IPv4 address (e.g. "127.0.0.1") to connect to a RCCService instance at 127.0.0.1 with port 64989, or manually set the SOAP port with a colon (e.g. "127.0.0.1:12345").`)
                return
            }

            if (soap.isConnected() && soap.getFormattedIP() == soap.formatIP(ip.address, ip.port)) {
                console.log(c.r("You are already connected to this RCCService instance!"))
                return
            }

            soap.disconnect()
            
            let spinner = ora(`Connecting to ${c.y(ip.address)}...`)
            spinner.start()

            let start = Date.now()
            await soap.connect(ip.address, ip.port)
            let elapsed = Date.now() - start

            let error = soap.fault()
            if (error) {
                spinner.fail(error)
            } else {
                spinner.succeed(`Connected to ${c.y(soap.getFormattedIP())}! (took ${elapsed + "ms"})`)
            }
        }
    },
    "disconnect": {
        description: "disconnects from the connected RCCService instance",
        handler: () => {
            if (!soap.isConnected()) {
                console.log(c.r("You must first be connected to a RCCService instance in order to disconnect!"))
                return
            }

            console.log(`Disconnected from ${c.y(soap.getFormattedIP())}`) // we didn't actually disconnect (yet) but they don't need to know that
            soap.disconnect()
        }
    },
    "version": {
        description: "prints the version number of the connected RCCService instance",
        handler: async () => {
            if (!soap.isConnected()) {
                console.log(c.r("You are not connected to a RCCService instance!"))
                return
            }

            let spinner = ora(`Sending...`)
            spinner.start()

            let response = await soap.send([{
                "GetVersion": {}
            }])

            let error = soap.fault()
            if (!error) {
                spinner.succeed(`Connected to RCCService version ${c.y(response)}!`)
            } else {
                spinner.fail(error)
            }
        }
    },
    "ping": {
        description: "pings the connected RCCService instance",
        handler: async () => {
            if (!soap.isConnected()) {
                console.log(c.r("You are not connected to a RCCService instance!"))
                return
            }

            let spinner = ora(`Sending...`)
            spinner.start()

            let start = Date.now()
            let response = await soap.send([{
                "HelloWorld": {}
            }])
            let elapsed = Date.now() - start

            let error = soap.fault()
            if (!error) {
                spinner.succeed(`Pong! (RCCService returned "${response}" in ${c.g(`${elapsed}ms`)})`)
            } else {
                spinner.fail(error)
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
                    let x = 0
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

                        if (x == Object.keys(operation.parameters).length - 1) {
                            console.log(")")
                        } else {
                            process.stdout.write(", ")
                        }

                        x++
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
            console.log("Farewell!")
            process.exit(0)
        }
    }
}

const operations = {
    "HelloWorld": {
        returns: "string",
        handler: async () => {
            let spinner = ora(`Sending...`)
            spinner.start()

            let start = Date.now()
            let response = await soap.send([{
                "HelloWorld": {}
            }])
            let elapsed = Date.now() - start

            let error = soap.fault()
            if (!error) {
                spinner.succeed(`RCCService returned "${response}"! (took ${c.g(elapsed + "ms")})`)
            } else {
                spinner.fail(error)
            }
        }
    },
    "GetVersion": {
        returns: "string",
        handler: async () => {
            let spinner = ora(`Sending...`)
            spinner.start()

            let start = Date.now()
            let response = await soap.send([{
                "GetVersion": {}
            }])
            let elapsed = Date.now() - start

            let error = soap.fault()
            if (!error) {
                spinner.succeed(`RCCService returned "${response}"! (took ${c.g(elapsed + "ms")})`)
            } else {
                spinner.fail(error)
            }
        }
    },
    "GetStatus": {
        returns: {
            userdata: true,
            type: "Status",
        },
        handler: async () => {
            let spinner = ora(`Sending...`)
            spinner.start()

            let start = Date.now()
            let response = await soap.send([{
                "Status": {}
            }])
            let elapsed = Date.now() - start

            let error = soap.fault()
            if (!error) {
                spinner.succeed(`RCCService returned the following response in ${c.g(elapsed + "ms")}:`)
                console.log(colorize(response, { pretty: true }))
            } else {
                spinner.fail(error)
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
            let spinner = ora(`Sending...`)
            spinner.start()

            let start = Date.now()

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

            let elapsed = Date.now() - start

            let error = soap.fault()
            if (!error) {
                spinner.succeed(`RCCService returned the following response in ${c.g(elapsed + "ms")}:`)
                console.log(colorize(response, { pretty: true }))
            } else {
                spinner.fail(error)
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
            let spinner = ora(`Sending...`)
            spinner.start()

            let start = Date.now()
            let response = await soap.send([{
                "RenewLease": {
                    "jobID": jobID,
                    "expirationInSeconds": expirationInSeconds
                }
            }])
            let elapsed = Date.now() - start

            let error = soap.fault()
            if (!error) {
                spinner.succeed(`RCCService returned "${response}"! (took ${c.g(elapsed + "ms")})`)
            } else {
                spinner.fail(error)
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
            let spinner = ora(`Sending...`)
            spinner.start()

            let start = Date.now()

            if (fs.existsSync(script)) {
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

            let elapsed = Date.now() - start

            let error = soap.fault()
            if (!error) {
                spinner.succeed(`RCCService returned the following response in ${c.g(elapsed + "ms")}:`)
                console.log(colorize(response, { pretty: true }))
            } else {
                spinner.fail(error)
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
            let spinner = ora(`Sending...`)
            spinner.start()

            let start = Date.now()

            await soap.send([{
                "CloseJob": {
                    "jobID": jobID
                }
            }])

            let elapsed = Date.now() - start

            let error = soap.fault()
            if (!error) {
                spinner.succeed(`Successfully closed job with ID "${jobID}"! (took ${c.g(elapsed + "ms")})`)
            } else {
                spinner.fail(error)
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
            let spinner = ora(`Sending...`)
            spinner.start()

            let start = Date.now()

            if (fs.existsSync(script)) {
                script = fs.readFileSync(script, "utf8")
            }

            let response = await soap.send([{
                "BatchJob": {
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

            let elapsed = Date.now() - start

            let error = soap.fault()
            if (!error) {
                spinner.succeed(`RCCService returned the following response in ${c.g(elapsed + "ms")}:`)
                console.log(colorize(response, { pretty: true }))
            } else {
                spinner.fail(error)
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
            let spinner = ora(`Sending...`)
            spinner.start()

            let start = Date.now()
            let response = await soap.send([{
                "GetExpiration": {
                    "jobID": jobID
                }
            }])
            let elapsed = Date.now() - start

            let error = soap.fault()
            if (!error) {
                spinner.succeed(`RCCService returned "${response}"! (took ${c.g(elapsed + "ms")})`)
            } else {
                spinner.fail(error)
            }
        }
    },
    "GetAllJobs": {
        returns: {
            userdata: true,
            type: "Job[]"
        },
        handler: async () => {
            let spinner = ora(`Sending...`)
            spinner.start()

            let start = Date.now()
            let response = await soap.send([{
                "GetAllJobs": {}
            }])
            let elapsed = Date.now() - start

            let error = soap.fault()
            if (!error) {
                spinner.succeed(`RCCService returned the following response in ${c.g(elapsed + "ms")}:`)
                console.log(colorize(response, { pretty: true }))
            } else {
                spinner.fail(error)
            }
        }
    },
    "CloseExpiredJobs": {
        returns: "int",
        handler: async () => {
            let spinner = ora(`Sending...`)
            spinner.start()

            let start = Date.now()
            let response = await soap.send([{
                "CloseExpiredJobs": {}
            }])
            let elapsed = Date.now() - start

            let error = soap.fault()
            if (!error) {
                spinner.succeed(`RCCService returned "${response}"! (took ${c.g(elapsed + "ms")})`)
            } else {
                spinner.fail(error)
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
            let spinner = ora(`Sending...`)
            spinner.start()

            let start = Date.now()
            let response = await soap.send([{
                "Diag": {
                    "type": type,
                    "jobID": jobID
                }
            }])
            let elapsed = Date.now() - start

            let error = soap.fault()
            if (!error) {
                spinner.succeed(`RCCService returned the following response in ${c.g(elapsed + "ms")}:`)
                console.log(colorize(response, { pretty: true }))
            } else {
                spinner.fail(error)
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

    console.log(`Version ${app.version}`)
    console.log(`${c.b(app.url)}\n`)

    console.log(`Type ${c.y("help")} to get started`)
}

async function open(options) {
    startup()

    if (options.hasOwnProperty("connect")) {
        await commands.connect.handler(options.connect)
    }

    feed()
}

async function feed() {
    io.question(`${soap.isConnected() ? c.y(soap.getFormattedIP()) : ""}> `, async (input) => {
        if (input == "help") {
            commands.help.handler()
        } else if (input == "exit") {
            commands.exit.handler()
        } else if (input == "disconnect") {
            commands.disconnect.handler()
        } else if (input == "version") {
            commands.version.handler()
        } else if (input == "operations") {
            commands.operations.handler()
        } else if (input == "commands") {
            commands.commands.handler()
        } else if (input.includes("connect")) {
            await commands.connect.handler(input.split(" ")[1])
        } else if (input == "ping") {
            await commands.ping.handler()
        }

        feed()
    })
}

export default { open }