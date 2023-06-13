import { XMLParser } from "fast-xml-parser"

const template = 
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
    "<SOAP-ENV:Envelope xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:SOAP-ENC=\"http://schemas.xmlsoap.org/soap/encoding/\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:ns1=\"http://roblox.com/\" xmlns:ns2=\"http://roblox.com/RCCServiceSoap\" xmlns:ns3=\"http://roblox.com/RCCServiceSoap12\">" +
    "<SOAP-ENV:Body>" +
    "{{body}}" +
    "</SOAP-ENV:Body>" +
    "</SOAP-ENV:Envelope>"

const parser = new XMLParser()

function getLuaType(value) {
    switch (typeof value) {
        case "undefined":
        case "object": 
            /*
             * This function is called under the presumption that checks for arrays and objects have already been made
             * (and thus appropriately sent back to generateLuaValueXml). However, since JavaScript considers null and
             * undefined to be objects, and knowing that the value is not going to be an object, we can safely return
             * LUA_TNIL.
             */

            return "LUA_TNIL" 
        case "boolean":
            return "LUA_TBOOLEAN"
        case "number":
        case "bigint":
            return "LUA_TNUMBER"
        case "string":
        case "symbol":
            return "LUA_TSTRING"
        default:
            return "LUA_TNIL"
    }
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
        let type = getLuaType(value)

        xml += `<ns1:type>${type}</ns1:type>`
        xml += type != "LUA_TNIL" ? `<ns1:value>${value}</ns1:value>` : ""
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
            xml += value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
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

function getJsValueFromLuaXml(xml) {
    switch (xml["ns1:type"]) {
        case "LUA_TTABLE":
            return parseLuaValueXml(xml["ns1:table"]["ns1:LuaValue"])
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
    let result = null

    if (Array.isArray(value)) {
        result = []
        for (let element of value) {
            result.push(getJsValueFromLuaXml(element))
        }
    } else {
        result = [ getJsValueFromLuaXml(value) ]
    }

    return result
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
        response.error = `Corrupted SOAP response - ${e}`
        return response
    }

    if (body.hasOwnProperty("SOAP-ENV:Fault")) {
        response.error = `RCCService error - ${body["SOAP-ENV:Fault"]["faultstring"]}`
        return response
    }

    try
    {
        body = Object.values(body)[0]

        if (!body) {
            response.data = null
            response.success = true
            return response
        }

        let type = Object.keys(body)[0].split(":")[1].replace("Result", "")
    
        // TODO: Perhaps don't hardcode this? We can probably check if the type is a LuaValue[] in a better way.
        if (type == "OpenJob" || type == "Execute" || type == "BatchJob" || type == "Diag") {
            body = parseLuaValueXml(Object.values(body)[0])
            
            if (body.length == 1) {
                body = body[0]
            }
        } else {
            if (Object.values(body).length == 1) {
                body = Object.values(body)[0]
            }
        
            if (typeof body === "object") {
                let reconstructed = []
    
                if (!Array.isArray(body)) {
                    body = [body]
                }
        
                for (let element of body) {
                    let keys = Object.keys(element)
                    let values = Object.values(element)
                    let cleaned = {}
            
                    for (let key of keys) {
                        let value = values[keys.indexOf(key)].toString()
    
                        // Edge case for version strings (e.g. 0.1.2.3) which accidentally gets casted into a float
                        if (value.match(/./g || []).length <= 1) {
                            value = parseFloat(value) === NaN ? value : parseFloat(value)
                        }
    
                        cleaned[key.split(":")[1]] = value
                    }
            
                    reconstructed.push(cleaned)
                }
        
                if (reconstructed.length == 1) {
                    reconstructed = reconstructed[0]
                }
    
                body = reconstructed
            }
        }
    } catch (e) {
        response.error = `Failed to parse response - ${e}`
        return response
    }

    response.success = true
    response.data = body

    return response
}

export default { generateEnvelope, parseEnvelope }
