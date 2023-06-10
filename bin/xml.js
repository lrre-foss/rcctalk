const { XMLParser } = require("fast-xml-parser")

const template = 
    "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
    "<SOAP-ENV:envelope xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:SOAP-ENC=\"http://schemas.xmlsoap.org/soap/encoding/\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:ns1=\"http://roblox.com/\" xmlns:ns2=\"http://roblox.com/RCCServiceSoap\" xmlns:ns3=\"http://roblox.com/RCCServiceSoap12\">" +
    "<SOAP-ENV:Body>" +
    "{{body}}" +
    "</SOAP-ENV:Body>" +
    "</SOAP-ENV:envelope>"

/*
    body: [
        {"HelloWorld": {}}, // "Hello World"

        {"GetVersion": {}},

        {"OpenJob": {
            "job": {
                "id": "",
                "expirationInSeconds": 0,
                "category": 0,
                "cores": 0
            },

            "script": {
                "name": "Starter Script",
                "script": "print(\"Hello, world!\")",
                "arguments": []
            }
        }},

        {"BatchJob": {
            "job": {
                "id": "",
                "expirationInSeconds": 0,
                "category": 0,
                "cores": 0
            },

            "script": {
                "name": "Starter Script",
                "script": "print(\"Hello, world!\")",
                "arguments": []
            }
        }},

        {"CloseJob": {
            "jobID": ""
        }},

        {"RenewLease": {
            "jobID": "",
            "expirationInSeconds": 0
        }},

        {"GetExpiration": {
            "jobID": ""
        }},

        {"Execute": {
            "jobID": "",
            "script": "print(\"Hello, world!\")",
            "arguments": []
        }},

        {"Diag": {
            "type": 0,
            "jobID": ""
        }},

        {"GetStatus": {}}, // status: {"version": "", "environmentCount": 0}
        {"GetAllJobs": {}}, // jobs: [{"id": "", "expirationInSeconds": 0, "category": 0, "cores": 0}, ...]
        {"CloseAllJobs": {}}
        {"CloseExpiredJobs": {}}
    ]
*/

function generateOperationXml(operation) {
    let xml = ""

    for (let key in operation) {
        xml += `<ns1:${key}>`

        let value = operation[key]

        if (typeof value === "object") {
            xml += generateOperationXml(value)
        } else {
            xml += key == "arguments" ? generateLuaArgumentsXml(value) : value
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

module.exports = { generateEnvelope }