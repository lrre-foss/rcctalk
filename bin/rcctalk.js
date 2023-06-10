#!/usr/bin/env node

const { program } = require("commander")
const xml = require("./xml")

program
    .option("-c, --connect <ip:port>", "connect to a RCCService instance")

program.parse()