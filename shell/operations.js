import humanizeDuration from "humanize-duration"
import { v4 as uuid } from "uuid"

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
                data: await net.send([{ "GetStatus": null }])
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
        handler: async (parameters) => {
            return {
                data: await net.send([{
                    "Diag": {
                        "type": parameters.type,
                        "jobID": parameters.jobID
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
            "script": {
                type: "string",
                required: true
            },
            "arguments": {
                type: "array",
                required: false,
                default: []
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
            }
        },
        handler: async (parameters) => {
            return {
                data: await net.send([{
                    "OpenJob": {
                        "job": {
                            "id": parameters.jobID,
                            "expirationInSeconds": parameters.expirationInSeconds,
                            "category": parameters.category,
                            "cores": parameters.cores
                        },
                        
                        "script": {
                            "name": "Starter Script",
                            "script": parameters.script,
                            "arguments": parameters.arguments
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
            "script": {
                type: "string",
                required: true
            },
            "arguments": {
                type: "array",
                required: false,
                default: []
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
            }
        },
        handler: async (parameters) => {
            return {
                data: await net.send([{
                    "BatchJob": {
                        "job": {
                            "id": parameters.jobID,
                            "expirationInSeconds": parameters.expirationInSeconds,
                            "category": parameters.category,
                            "cores": parameters.cores
                        },
                        
                        "script": {
                            "name": "Starter Script",
                            "script": parameters.script,
                            "arguments": parameters.arguments
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
        handler: async (parameters) => {
            return {
                data: await net.send([{
                    "Execute": {
                        "jobID": parameters.jobID,
                        "script": {
                            "name": uuid(),
                            "script": parameters.script,
                            "arguments": parameters.arguments
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
        handler: async (parameters) => {
            return await net.send([{
                "RenewLease": {
                    "jobID": parameters.jobID,
                    "expirationInSeconds": parameters.expirationInSeconds
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
        handler: async (parameters) => {
            let response = await net.send([{ "GetExpiration": { "jobID": parameters.jobID } }])

            return {
                message: `Expiration for job with jobID "${parameters.jobID}" is ${util.yellow("{0}")} seconds (approx. ${humanizeDuration(Math.floor(response) * 1000)} from now)! (took ${util.green("{1}ms")})`,
                data: response
            }
        }
    },
    "GetAllJobs": {
        returns: {
            userdata: true,
            type: "Job[]"
        },
        handler: async () => {
            let response = await net.send([{ "GetAllJobs": null }])

            return {
                data: response === null ? [] : response
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
        handler: async (parameters) => {
            await net.send([{ "CloseJob": { "jobID": parameters.jobID } }])

            return {
                message: `Succesfully closed job with ID "{0}"! (took ${util.green("{1}ms")})`,
                data: parameters.jobID
            }
        }
    },
    "CloseAllJobs": {
        returns: "int",
        handler: async () => {
            return {
                message: `Succesfully closed ${util.yellow("{0}")} jobs! (took ${util.green("{1}ms")})`,
                data: await net.send([{ "CloseAllJobs": null }])
            }
        }
    },
    "CloseExpiredJobs": {
        returns: "int",
        handler: async () => {
            return {
                message: `Succesfully closed ${util.yellow("{0}")} expired jobs! (took ${util.green("{1}ms")})`,
                data: await net.send([{ "CloseExpiredJobs": null }])
            }
        }
    }
}