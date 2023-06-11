import { XMLParser, XMLValidator } from "fast-xml-parser"

const template = 
    "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
    "<SOAP-ENV:envelope xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:SOAP-ENC=\"http://schemas.xmlsoap.org/soap/encoding/\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:ns1=\"http://roblox.com/\" xmlns:ns2=\"http://roblox.com/RCCServiceSoap\" xmlns:ns3=\"http://roblox.com/RCCServiceSoap12\">" +
    "<SOAP-ENV:Body>" +
    "{{body}}" +
    "</SOAP-ENV:Body>" +
    "</SOAP-ENV:envelope>"

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

function generateLuaArguments(data) {
    let xml = ""

    for (let argument of data) {
        xml += generateLuaValueXml(argument)
    }

    return xml
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
        xml += `<ns1:value>${value}</ns1:value>`
    }

    xml += "</ns1:LuaValue>"
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

    return template.replace("{{body}}", xml)
}

export default { generateEnvelope }