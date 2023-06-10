const boilerplate = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
    "<SOAP-ENV:envelope xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:SOAP-ENC=\"http://schemas.xmlsoap.org/soap/encoding/\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:ns1=\"http://roblox.com/\" xmlns:ns2=\"http://roblox.com/RCCServiceSoap\" xmlns:ns3=\"http://roblox.com/RCCServiceSoap12\">\n" +
    "    <SOAP-ENV:Body>\n" +
    "        {{body}}\n" +
    "    </SOAP-ENV:Body>\n"
    "</SOAP-ENV:envelope>"

function generateEnvelope(body) {
    let xml = ""

    for (let i = 0; i < body.length; i++) {
        let action = body[i]
        
        let key = Object.keys(action)[0]
        let value = action[key]

        xml += "<ns1:" + key + ">\n"

        xml += "</ns1:" + key + ">\n"
    }

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
}

module.exports = { generateEnvelope }