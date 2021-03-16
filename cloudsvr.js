/**
 * File:    cloudsvr.js
 * Notes:   Cloud Node JS server
 *  This file posts data to another node
 *  using HTTPS
 * 
 * History:
 *  2021/03/15 Written by Simon Platten
 */
'use strict'
//Include modules
const cmn               = require("./incs/common")
const { EventEmitter }  = require("events")
const fs                = require("fs")
const https             = require("https")
//Display the application start-up message
cmn.titleBlock("Cloud NodeJS Server", "1.00")
let blnNextRequest = true, blnVerbose = true, lngReqNo = 0
   ,options = {"hostname":  cmn.defs.HOST_BEAGLEBONE
              ,"port":      cmn.defs.PORT_BEAGLEBONE_LSTNG
              ,"path":      "/"
              ,"ca":        fs.readFileSync("cert.pem")
              ,"checkServerIdentity": (host, cert) => {
                return undefined    
              }
              ,"method":    "POST"
              ,"headers":   {
                  "Content-Type":   "application/octet-stream"
                 ,"Content-Length": 0
              }}, req
    //Update agent
    options.agent = new https.Agent(options)
setInterval(() => {
    if ( blnNextRequest != true ) {
    //Not ready for next request yet!
        return
    }
    //Prevent timer from getting any further until this flag has been set to true
    blnNextRequest = false
    req = https.request(options, (res) => {
        res.on("data", (d) => {
            process.stdout.write(cmn.strMoveCursor(7, 1) + cmn.defs.BLUE + d + cmn.defs.RESET)
            blnNextRequest = true
        })
    })
    req.on("error", (err) => 
        console.error(cmn.defs.RED + err.message + cmn.defs.RESET));
    //Create data to send        
    let objRequest = {"server": {"reqNo": (++lngReqNo)
                        ,"time": (new Date()).getTime()}}
       ,txBuffer = Buffer.from(JSON.stringify(objRequest))
    //Transmit buffer
    req.setHeader("Content-Length", txBuffer.length)    
    if ( req.write(txBuffer) == true && blnVerbose == true ) {        
        req.on("data", () => {
            if ( blnVerbose == true ) {
//Display information about processed JSON
                cmn.displayStats(7, 42, objRequest)
            }                
        })
    }
    req.end()
}, cmn.defs.REQUEST_FREQUENCY)