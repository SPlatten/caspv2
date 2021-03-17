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
const cmn           = require("./incs/common")
//Display the application start-up message
cmn.titleBlock("Cloud NodeJS Server", "1.00")
let blnNextRequest = true, blnVerbose = true
//Start HTTPS server
cmn.httpServer(cmn.defs.PORT_CLOUD_SERVER)      
//Install timer to update Beaglebone node.js
setInterval(() => {
    if ( blnNextRequest != true ) {
    //Not ready for next request yet!
        return
    }
    //Prevent timer from getting any further until this flag has been set to true
    blnNextRequest = false
/*    
    if ( intPort == defs.PORT_BEAGLEBONE_LSTNG ) {
        options = {"ca": fs.readFileSync("cert.pem")
 ,"checkServerIdentity": (host, cert) => {return undefined}
             ,"headers":   {
                 "Content-Type": "application/octet-stream"
              ,"Content-Length": 0}
            ,"hostname": defs.HOST_BEAGLEBONE
              ,"method": "POST"
                ,"path": "/"
                ,"port": defs.PORT_BEAGLEBONE_LSTNG}
*/                
    let options = {"ca": cmn.fs.readFileSync("cert.pem")
 ,"checkServerIdentity": (host, cert) => {return undefined}
             ,"headers": {"Content-Type": "application/octet-stream"
                       ,"Content-Length": 0}
            ,"hostname": cmn.defs.HOST_CLOUD
              ,"method": "POST"
                ,"path": "/"
                ,"port": cmn.defs.PORT_CLOUD_SERVER}
    //Update agent
    options.agent = new cmn.https.Agent(options)
    var req = cmn.https.request(options, (res) => {
        res.on("data", (d) => {
            process.stdout.write(cmn.strMoveCursor(7, 1) + cmn.defs.BLUE + d + cmn.defs.RESET)
            blnNextRequest = true
        })
    })
    req.on("error", (err) => 
        console.error(cmn.defs.RED + err.message + cmn.defs.RESET));    
    if ( cmn.aryHTTPSrx.length > 0 ) {
console.log("RX packets: " + cmn.aryHTTPSrx.length)        
    //Create data to send        
        let txBuffer = Buffer.from(JSON.stringify(objReceived))
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
    }
    req.end()
}, cmn.defs.REQUEST_FREQUENCY)