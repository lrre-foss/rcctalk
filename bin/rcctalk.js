#!/usr/bin/env node

import { Command } from "commander"

import app from "../app.js"

const program = new Command()

program
    .name("rcctalk")
    .description("RCCService communication utility")
    .version(app.version)

program
    .option("-c, --connect <ip>", "connect to a RCCService instance")

program.parse()

app.start(program.opts())