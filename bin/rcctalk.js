#! /usr/bin/env node

const { program } = require("commander")

program
    .option("-c, --connect <ip:port>", "connect to a RCCService instance")

program.parse()