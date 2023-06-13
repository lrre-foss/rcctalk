import * as network from "node:net"
import fetch from "node-fetch"

import isValidHostname from "is-valid-hostname"

import util from "./util.js"
import xml from "./xml.js"

var error = null
var hostname = {
    ip: null,
    port: null
}

// https://dmitripavlutin.com/timeout-fetch-request/
async function fetchWithTimeout(resource, options = {}) {
    let { timeout = 60000 } = options

    let controller = new AbortController()
    let id = setTimeout(() => controller.abort(), timeout)
  
    let response = await fetch(resource, {
        ...options,
        signal: controller.signal  
    })

    clearTimeout(id)

    return response
}

function sanitizeHostname(hostname) {
    if (!hostname.length) {
        return null
    }

    let split = hostname.split(":")
    if (split.length < 0 || split.length > 2) {
        return null
    }

    if (!network.isIPv4(split[0])) {
        // Perhaps its a hostname?
        if (!isValidHostname(split[0])) {
            return null
        }
    }

    let ip = split[0]
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

    return { ip, port }
}

function formatHostname(hostname) {
    return hostname.ip + (hostname.port == 64989 ? "" : ":" + port)
}

function getFormattedHostname() {
    return formatHostname(hostname)
}

function isConnected() {
    return hostname.ip !== null && hostname.port !== null
}

// This function sucks (and is a bit of a hack)
function fault() {
    let result = error
    error = null
    return result
}

// TODO: Wouldn't this be better as a constructor for a class?
async function connect(ip, port) {
    // We do this instead of send() to get a more verbose output upon failure
    try {
        let response = await fetchWithTimeout(`http://${ip}:${port}/`, {
            method: "POST",
            body: xml.generateEnvelope([{ "HelloWorld": null }]),
            timeout: 60000,
            headers: {
                "Content-Type": "application/xml"
            }
        })

        let text = await response.text()
        let parsed = xml.parseEnvelope(text)

        if (!parsed.success) {
            throw `Error in response (${parsed.error})`
        }
    } catch (e) {
        error = `${util.red("Failed to connect to RCCService instance")}: ${e}`
        return false
    }

    hostname = { ip, port }

    return true
}

function disconnect() {
    hostname = { ip: null, port: null }
}

async function send(data) {
    let envelope = xml.generateEnvelope(data)
    let response = null

    try {
        response = await fetchWithTimeout(`http://${hostname.ip}:${hostname.port}/`, {
            method: "POST",
            body: envelope,
            timeout: 60000,
            headers: {
                "Content-Type": "application/xml"
            }
        })
    } catch (e) {
        error = `${util.red("Failed to send data to RCCService instance")}: ${e}`
        response = null
    }

    if (response != null) {
        let parsed = xml.parseEnvelope(await response.text())

        if (parsed.error) {
            error = `${util.red("Error")}: ${parsed.error}`
            return null
        }

        response = parsed.data
    }

    return response
}

export default { sanitizeHostname, formatHostname, getFormattedHostname, isConnected, fault, connect, disconnect, send }