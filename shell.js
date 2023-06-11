import connection from "./connection.js"

const commands = [
    {
        name: "connect",
        description: "connect to a RCCService instance",
        parameters: ["ip"]
    },
    {
        name: "disconnect",
        description: "disconnects from the connected RCCService instance",
        handler: connection.disconnect
    },
    {
        name: "version",
        description: "output the version number of the connected RCCService instance"
    },
    {
        name: "ping",
        description: "pings the connected RCCService instance"
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
        description: "closes rcctalk"
    }
]

const operations = []