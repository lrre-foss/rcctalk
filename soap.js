import fetch from "node-fetch"
import { isIPv4 } from "is-ip"

import c from "./chalk.js"
import xml from "./xml.js"

var ip = null
var port = null
var errorMessage = null

function sanitize(ip) {
    if (!ip.length) {
        return null
    }

    let split = ip.split(":")
    if (split.length < 0 || split.length > 2) {
        return null
    }

    if (!isIPv4(split[0])) {
        return null
    }

    let address = split[0]
    let port = 64989

    if (split.length == 2) {
        port = parseInt(split[1])
        if (isNaN(port)) {
            return null
        }

        if (port < 0 || port > 65535) {
            return null
        }
    }

    return {
        "address": address,
        "port": port
    }
}

function getIP() {
    return ip
}

function fault(displayError = true) {
    let result = errorMessage != null

    if (displayError) {
        error()
    }

    return result
}

function error() {
    console.log(errorMessage)
    errorMessage = null

    return errorMessage
}

async function connect(_ip, _port) {
    // TODO: Wouldn't this be better as a constructor for a class?
    ip = _ip
    port = _port

    // We do this instead of send() to get a more verbose output on failure
    try {
        let response = await fetch(`http://${ip}:${port}/`, {
            method: "POST",
            body: xml.generateEnvelope([{"HelloWorld": ""}]),
            headers: {
                "Content-Type": "text/plain"
            }
        })

        let text = await response.text()
        let parsed = xml.parseEnvelope(text)

        if (!parsed.success) {
            throw `Error in response (${parsed.error})`
        }
    } catch (e) {
        errorMessage = `${c.r("Failed to connect to RCCService instance")}: ${e}`
        return false
    }

    return true
}

async function disconnect() {
    ip = null
    port = null
}

async function send(data) {
    let envelope = xml.generateEnvelope(data)
    let response = null

    try {
        response = await fetch(`http://${ip}:${port}/`, {
            method: "POST",
            body: envelope,
            headers: {
                "Content-Type": "text/plain"
            }
        })
    } catch (e) {
        errorMessage = `${c.r("Failed to send data to RCCService instance")}: ${e}`
        response = null
    }

    if (response != null) {
        let parsed = xml.parseEnvelope(await response.text())
        if (parsed.error) {
            errorMessage = `${c.r("Error")}: ${parsed.error}`
            return null
        }

        response = parsed.data
    }

    return response
}

export default { sanitize, getIP, fault, error, connect, disconnect, send }