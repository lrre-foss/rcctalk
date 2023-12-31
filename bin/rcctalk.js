#!/usr/bin/env node

import { Command } from "commander"

import app from "../app.js"

const program = new Command()

program
    .name("rcctalk")
    .description("RCCService communication utility")
    .version(app.version)

program
    .option("-c, --connect <hostname>", "connect to a RCCService instance at the specified hostname (default port: 64989)")

program.parse()

app.start(program.opts())