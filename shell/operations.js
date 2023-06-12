import net from "../net.js"
import util from "../util.js"

export default {
    "HelloWorld": {
        returns: "string",
        handler: async () => {
            return await net.send([{ "HelloWorld": null }])
        }
    },
    "GetVersion": {
        returns: "string",
        handler: async () => {
            return await net.send([{ "GetVersion": null }])
        }
    },
    "GetStatus": {
        returns: {
            userdata: true,
            type: "Status",
        },
        handler: async () => {
            return {
                data: await net.send([{ "Status": null }])
            }
        }
    },
    "Diag": {
        returns: {
            userdata: true,
            type: "LuaValue[]",
            required: false
        },
        parameters: {
            "type": {
                type: "int",
                required: true
            },
            "jobID": {
                type: "string",
                required: false
            }
        },
        handler: async (type, jobID) => {
            return {
                data: await net.send([{
                    "Diag": {
                        "type": type,
                        "jobID": jobID
                    }
                }])
            }
        }
    },
    "OpenJob": {
        returns: {
            userdata: true,
            type: "LuaValue[]",
        },
        parameters: {
            "jobID": {
                type: "string",
                required: true
            },
            "expirationInSeconds": {
                type: "double",
                required: false,
                default: 300
            },
            "category": {
                type: "int",
                required: false,
                default: 0
            },
            "cores": {
                type: "int",
                required: false,
                default: 1
            },
            "script": {
                type: "string",
                required: true
            },
            "arguments": {
                type: "array",
                required: false,
                default: []
            }
        },
        handler: async (jobID, expirationInSeconds, category, cores, script, data) => {
            return {
                data: await net.send([{
                    "OpenJob": {
                        "job": {
                            "id": jobID,
                            "expirationInSeconds": expirationInSeconds,
                            "category": category,
                            "cores": cores
                        },
                        
                        "script": {
                            "name": "Starter Script",
                            "script": script,
                            "arguments": data
                        }
                    }
                }])
            }
        }
    },
    "BatchJob": {
        returns: {
            userdata: true,
            type: "LuaValue[]",
        },
        parameters: {
            "jobID": {
                type: "string",
                required: true
            },
            "expirationInSeconds": {
                type: "double",
                required: false,
                default: 300
            },
            "category": {
                type: "int",
                required: false,
                default: 0
            },
            "cores": {
                type: "int",
                required: false,
                default: 1
            },
            "script": {
                type: "string",
                required: true
            },
            "arguments": {
                type: "array",
                required: false,
                default: []
            }
        },
        handler: async (jobID, expirationInSeconds, category, cores, script, data) => {
            return {
                data: await net.send([{
                    "BatchJob": {
                        "job": {
                            "id": jobID,
                            "expirationInSeconds": expirationInSeconds,
                            "category": category,
                            "cores": cores
                        },
                        
                        "script": {
                            "name": "Starter Script",
                            "script": script,
                            "arguments": data
                        }
                    }
                }])
            }
        }
    },
    "Execute": {
        returns: {
            userdata: true,
            type: "LuaValue[]",
        },
        parameters: {
            "jobID": {
                type: "string",
                required: true
            },
            "script": {
                type: "string",
                required: true
            },
            "arguments": {
                type: "array",
                required: false,
                default: []
            }
        },
        handler: async (jobID, script, data) => {
            return {
                data: await net.send([{
                    "Execute": {
                        "jobID": jobID,
                        "script": {
                            "name": uuid(),
                            "script": script,
                            "arguments": data
                        }
                    }
                }])
            }
        }
    },
    "RenewLease": {
        returns: "double",
        parameters: {
            "jobID": {
                type: "string",
                required: true
            },
            "expirationInSeconds": {
                type: "double",
                required: true
            }
        },
        handler: async (jobID, expirationInSeconds) => {
            return await net.send([{
                "RenewLease": {
                    "jobID": jobID,
                    "expirationInSeconds": expirationInSeconds
                }
            }])
        }
    },
    "GetExpiration": {
        returns: "double",
        parameters: {
            "jobID": {
                type: "string",
                required: true
            },
        },
        handler: async () => {
            return {
                message: `Expiration for job with jobID "${jobID}" is ${util.yellow("%d")} seconds (took ${util.green("%sms")})`,
                data: await net.send([{ "GetExpiration": { "jobID": jobID } }])
            }
        }
    },
    "GetAllJobs": {
        returns: {
            userdata: true,
            type: "Job[]"
        },
        handler: async () => {
            return {
                data: await net.send([{ "GetAllJobs": null }])
            }
        }
    },
    "CloseJob": {
        returns: "void",
        parameters: {
            "jobID": {
                type: "string",
                required: true
            },
        },
        handler: async (jobID) => {
            return {
                message: `Succesfully closed job with ID "${jobID}"! (took ${util.green("%sms")})`,
                data: await net.send([{ "CloseJob": { "jobID": jobID } }])
            }
        }
    },
    "CloseAllJobs": {
        returns: "int",
        handler: async () => {
            return {
                message: `Succesfully closed ${util.yellow("%d")} jobs! (took ${util.green("%sms")})`,
                data: await net.send([{ "CloseAllJobs": null }])
            }
        }
    },
    "CloseExpiredJobs": {
        returns: "int",
        handler: async () => {
            return {
                message: `Succesfully closed ${util.yellow("%d")} expired jobs! (took ${util.green("%sms")})`,
                data: await net.send([{ "CloseExpiredJobs": null }])
            }
        }
    }
}