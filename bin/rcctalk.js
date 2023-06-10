#!/usr/bin/env node

const { program } = require("commander")
const xml = require("./xml")

program
    .option("-c, --connect <ip:port>", "connect to a RCCService instance")

program.parse()

console.log(xml.generateEnvelope([{"OpenJob": {
    "job": {
        "id": "",
        "expirationInSeconds": 0,
        "category": 0,
        "cores": 0
    },

    "script": {
        "name": "Starter Script",
        "script": "print(\"Hello, world!\")",
        "arguments": [1, 2, "three"]
    }
}}]))