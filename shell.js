import chalk from "chalk"

import connection from "./connection.js"

const commands = {
    "connect": {
        description: "connect to a RCCService instance",
        parameters: ["ip"],
        handler: async (ip) => {
            await connection.connect(ip)
            console.log(`Connected to ${connection.getIp()}`)
        }
    },
    "disconnect": {
        description: "disconnects from the connected RCCService instance",
        handler: connection.disconnect
    },
    "version": {
        description: "output the version number of the connected RCCService instance",
        handler: async () => {
            let result = await connection.send([{
                "GetVersion": {}
            }])

            if (!connection.fault()) {
                console.log(`Connected to RCCService version ${result}`)
            }
        }
    },
    "ping": {
        description: "pings the connected RCCService instance",
        handler: async () => {
            let result = await connection.send([{
                "HelloWorld": {}
            }])

            if (!connection.fault()) {
                console.log(`Pong! (RCCService returned "${result}" in ${time}ms)`)
            }
        }
    },
    "help": {
        description: "displays all available operations and commands",
        handler: () => {
            commands.operations.handler()
            commands.commands.handler()
        }
    },
    "operations": {
        description: "displays all available operations",
        handler: () => {

        }
    },
    "commands": {
        description: "displays all available commands",
        handler: () => {
            console.log(chalk.whiteBright("Available commands:"))
            for (let command in commands) {
                console.log(`${chalk.grey("-")} ${chalk.whiteBright(command)}`)
                for (let parameter of commands[command].parameters) {
                    console.log(` ${chalk.whiteBright(parameter)}`)
                }

                console.log(` - ${commands[command].description}`)
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

const operations = []