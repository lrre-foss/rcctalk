import ora from "ora"

import operations from "./operations.js"

import net from "../net.js"
import util from "../util.js"

const commands = {
    "connect": {
        description: "connect to a RCCService instance at the specified hostname (default port: 64989)",
        parameters: ["hostname"],
        handler: async (parameters) => {
            if (net.isConnected()) {
                console.log(`${util.red("Error:")} Please disconnect before connecting to another RCCService instance!`)
                return
            }

            let hostname = net.sanitizeHostname(parameters[0])

            if (hostname === null) {
                console.log(`${util.red("Invalid hostname!")} Please input a valid IPv4 address (e.g. "127.0.0.1") or a hostname to connect to a RCCService instance at 127.0.0.1 with port 64989, or manually set the SOAP port with a colon (e.g. "127.0.0.1:12345").`)
                return
            }

            if (net.isConnected() && net.getFormattedHostname() == net.formatHostname(hostname)) {
                console.log(`${util.red("Error:")} You are already connected to this RCCService instance!`)
                return
            }

            net.disconnect()
            
            let spinner = ora(`Connecting to ${util.yellow(hostname.ip)}...`)
            spinner.start()

            let start = Date.now()
            await net.connect(hostname.ip, hostname.port)
            let elapsed = Date.now() - start

            let error = net.fault()
            error ? spinner.fail(error) : spinner.succeed(`Connected to ${util.yellow(net.getFormattedHostname())}! (took ${util.green(elapsed + "ms")})`)
        }
    },
    "disconnect": {
        description: "disconnects from the connected RCCService instance",
        requiresConnection: true,
        handler: () => {
            console.log(`Disconnected from ${util.yellow(net.getFormattedHostname())}`)
            net.disconnect()
        }
    },
    "version": {
        description: "prints the version number of the connected RCCService instance",
        requiresConnection: true,
        handler: async () => {
            let spinner = ora(`Sending...`)
            spinner.start()

            let response = await net.send([{ "GetVersion": null }])

            let error = net.fault()
            error ? spinner.fail(error) : spinner.succeed(`Currently connected to RCCService version ${util.yellow(response)}!`)
        }
    },
    "ping": {
        description: "pings the connected RCCService instance",
        requiresConnection: true,
        handler: async () => {
            let spinner = ora(`Sending...`)
            spinner.start()

            let start = Date.now()
            let response = await net.send([{ "HelloWorld": null }])
            let elapsed = Date.now() - start

            let error = net.fault()
            error ? spinner.fail(error) : spinner.succeed(`Pong! (RCCService returned "${response}" in ${util.green(elapsed + "ms")})`)
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
    "commands": {
        description: "displays all available commands",
        handler: () => {
            console.log(util.white("Available commands:"))

            for (let name in commands) {
                console.log(`${util.grey("-")} ${util.colorizeCommand(name, commands[name])} - ${commands[name].description}`)
            }
        }
    },
    "operations": {
        description: "displays all available operations",
        handler: () => {
            console.log(util.white("Available operations:"))

            for (let name in operations) {
                console.log(`${util.grey("-")} ${util.colorizeOperation(name, operations[name])}`)
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

export default commands