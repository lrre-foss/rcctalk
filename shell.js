import connection from "./connection.js"

const commands = [
    {
        name: "connect",
        description: "connect to a RCCService instance",
        parameters: ["ip"],
        handler: async (ip) => {
            await connection.connect(ip)
            console.log(`Connected to ${connection.getIp()}`)
        }
    },
    {
        name: "disconnect",
        description: "disconnects from the connected RCCService instance",
        handler: connection.disconnect
    },
    {
        name: "version",
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
    {
        name: "ping",
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
    {
        name: "help",
        description: "displays this help message"
    },
    {
        name: "operations",
        description: "displays all available operations"
    },
    {
        name: "commands",
        description: "displays all available commands"
    },
    {
        name: "exit",
        description: "closes rcctalk",
        handler: () => {
            process.exit(0)
        }
    }
]

const operations = []