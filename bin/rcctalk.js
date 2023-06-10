#!/usr/bin/env node

import { Command } from "commander"

import app from "../app.js"

const program = new Command()

program
    .name("rcctalk")
    .description("RCCService communication utility")
    .version("1.0.0")

program
    .option("-c, --connect <ip>", "connect to a RCCService instance", "127.0.0.1")
    .option("-o, --operations", "displays all available operations")

program.parse()

app.start(program.opts())