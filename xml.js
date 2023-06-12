import { XMLParser } from "fast-xml-parser"
import xmlFormat from "xml-formatter"

const template = 
    "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
    "<SOAP-ENV:envelope xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:SOAP-ENC=\"http://schemas.xmlsoap.org/soap/encoding/\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:ns1=\"http://roblox.com/\" xmlns:ns2=\"http://roblox.com/RCCServiceSoap\" xmlns:ns3=\"http://roblox.com/RCCServiceSoap12\">" +
    "<SOAP-ENV:Body>" +
    "{{body}}" +
    "</SOAP-ENV:Body>" +
    "</SOAP-ENV:envelope>"

const parser = new XMLParser()

function getLuaType(value) {
    let type = "LUA_T"

    switch (typeof value) {
        case "undefined":
        case "object": 
            type += "NIL"
            break
        case "boolean":
            type += "BOOLEAN"
            break
        case "number":
        case "bigint":
            type += "NUMBER"
            break
        case "string":
        case "symbol":
            type += "STRING"
            break
        default:
            type += "NIL"
            break
    }

    return type
}

function generateLuaValueXml(value) {
    let xml = ""
    xml += "<ns1:LuaValue>"

    if (typeof value === "object" && value !== null) {
        xml += `<ns1:type>LUA_TTABLE</ns1:type>`
        xml += "<ns1:table>"
        for (let key in value) {
            xml += generateLuaValueXml(key)
        }
        xml += "</ns1:table>"
    } else {
        xml += `<ns1:type>${getLuaType(value)}</ns1:type>`
        xml += `<ns1:value>${getLuaType(value) == "LUA_TNIL" ? "" : value}</ns1:value>`
    }

    xml += "</ns1:LuaValue>"
    return xml
}

function generateLuaArguments(data) {
    let xml = ""

    for (let argument of data) {
        xml += generateLuaValueXml(argument)
    }

    return xml
}

function generateOperationXml(operation) {
    let xml = ""

    for (let key in operation) {
        xml += `<ns1:${key}>`

        let value = operation[key]

        if (typeof value === "object") {
            xml += key == "arguments" ? generateLuaArguments(value) : generateOperationXml(value)
        } else {
            xml += value
        }

        xml += `</ns1:${key}>`
    }

    return xml
}

function generateEnvelope(operations) {
    let xml = ""

    for (let i = 0; i < operations.length; i++) {
        xml += generateOperationXml(operations[i])
    }

    // We prettify for two reasons:
    // 1. so that we don't seem that different from an actual SOAP envelope
    // 2. to make it easier to debug
    return xmlFormat(template.replace("{{body}}", xml))
}

function getJsValueFromLuaXml(xml) {
    switch (xml["ns1:type"]) {
        case "LUA_TBOOLEAN":
            return xml["ns1:value"] == "true"
        case "LUA_TNUMBER":
            return Number(xml["ns1:value"])
        case "LUA_TSTRING":
            return xml["ns1:value"]
        case "LUA_TNIL":
            return null
        default:
            return xml["ns1:value"]
    }
}

function parseLuaValueXml(value) {
    let parsed = []

    for (let element of value) {
        if (element.hasOwnProperty("ns1:value")) {
            parsed.push(getJsValueFromLuaXml(element))
        } else {
            let values = Object.values(element["ns1:table"])
            let table = []

            for (let value of values) {
                table.push(getJsValueFromLuaXml(value))
            }

            parsed.push(table)
        }
    }

    return parsed
}

function parseEnvelope(envelope) {
    let response = {
        "success": false,
        "error": null,
        "data": null
    }

    let body

    try {
        let result = parser.parse(envelope)
        body = result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]
    } catch (e) {
        response.error = `Corrupted SOAP envelope (${e})`
        return response
    }

    if (body.hasOwnProperty("SOAP-ENV:Fault")) {
        response.error = body["SOAP-ENV:Fault"]["faultstring"]
        return response
    }

    body = Object.values(body)[0]

    let type = Object.keys(body)[0].split(":")[1].replace("Result", "")
    
    if (type == "OpenJob" || type == "Execute" || type == "BatchJob" || type == "Diag") {
        // This is a LuaValue[]
        body = parseLuaValueXml(Object.values(body)[0])
    } else {
        if (Object.values(body).length == 1) {
            body = Object.values(body)[0]
        }
    
        if (typeof body === "object") {
            let reconstructed = []
    
            for (let element of body) {
                let keys = Object.keys(element)
                let values = Object.values(element)
                let cleaned = {}
        
                for (let key of keys) {
                    cleaned[key.split(":")[1]] = values[keys.indexOf(key)]
                }
        
                reconstructed.push(cleaned)
            }
    
            body = reconstructed
        }
    }

    response.success = true
    response.data = body
    
    return response
}

export default { generateEnvelope, parseEnvelope }