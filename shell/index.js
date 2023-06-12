import readline from "node:readline"

import colorize from "json-colorizer"
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
    let colorIndex = 13

    for (let line of lines) {
        console.log(util.red(line.slice(0, colorIndex)) + util.white(line.slice(colorIndex)))
    }

    console.log(`Version ${util.yellow(app.version)}`)
    console.log(`${util.blue(app.url)}\n`)

    console.log(`Type "${util.cyan("help")}" to get started`)
}

async function open(options) {
    startup()

    if (options.hasOwnProperty("connect")) {
        await commands.connect.handler(options.connect)
    }

    feed()
}

async function feed() {
    io.question(`${net.isConnected() ? util.yellow(net.getFormattedHostname()) : ""}> `, async (input) => {
        if (input == "help") {
            commands.help.handler()
        } else if (input == "exit") {
            commands.exit.handler()
        } else if (input == "disconnect") {
            commands.disconnect.handler()
        } else if (input == "version") {
            await commands.version.handler()
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