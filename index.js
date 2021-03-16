/**
 * File:    index.js
 * Notes:   Representation of BeagleBone Node Gateway
 * 
 * To test https connection, open terminal and use:
 *  curl -k https://localhost:8000
 * 
 * History:
 *  2021/03/12 Written by Simon Platten
 */
'use strict'
//Include modules
const { clsCASPv2 }     = require("bindings")("caspv2")
const cmn               = require("./incs/common")
const { EventEmitter }  = require("events")
const fs                = require("fs")
const https             = require("https")
const { inherits }      = require("util")
const path              = require("path")
const { pipeline }      = require("stream")
inherits(clsCASPv2, EventEmitter)
const caspv2 = new clsCASPv2(1)

let blnVerbose = true, lngBeagleBone = 0, lngReceived = 0
   ,objReceived, strCWD = path.dirname(__filename)
   ,svr = https.createServer({key:fs.readFileSync("key.pem")
                            ,cert:fs.readFileSync("cert.pem")}, (req, res) => {
    if ( req.method != "POST" ) {
//Shouldn't get here!        
        console.log(cmn.defs.RED + req.method + cmn.defs.RESET)
        return
    }
    const aryChunks = []                           
    req.on("data", (chunk) => aryChunks.push(chunk))
       .on("end", () => {        
        let strData = cmn.strCombineChunks(aryChunks)
        
        if ( typeof strData == "string" && strData.length > 0 ) {
//Convert the body to JSON   
            lngReceived = strData.length
            objReceived =  JSON.parse(strData)
        
            if ( typeof objReceived == "object" ) {    
//Add information at this stage     
                objReceived.beagleBone = {"reqNo": (++lngBeagleBone)
                                          ,"time": (new Date()).getTime()}            
//Forward received data to A-Safe application via pipe
                let aryMsg = cmn.aryPackageJSON(objReceived)
//Create PIPE                
                const pipeWrite = fs.createWriteStream(cmn.defs.PIPE_BB_TO_ASAFE)                
//Write message to it                
                pipeWrite.write(aryMsg)
            }
        }
    })
    req.on("error", (err) => console.error(cmn.defs.RED + err.message + cmn.defs.RESET))       
//Send response code back
    res.writeHead(200)
    res.end()        
});
//Display the application start-up message
cmn.titleBlock(caspv2.title(), "2.00")
//Report profile folder
cmn.displayDataWithPrompt(5, 24, process.env.HOME, "Profile: ")
cmn.displayDataWithPrompt(6, 19, strCWD, "Current path: ")

if ( typeof svr == "object" ) {
    svr.listen(cmn.defs.PORT_BEAGLEBONE_LSTNG)
    svr.on("error", (err) => console.error(cmn.defs.RED + err.message + cmn.defs.RESET))  
}
//Timer to check if PIPE has been modified
let tmLastModified, tmPrevModified
setInterval(() => {
    if ( fs.existsSync(cmn.defs.PIPE_ASAFE_TO_BB) != true ) {
        return
    }
    const stats = fs.statSync(cmn.defs.PIPE_ASAFE_TO_BB)
    tmLastModified = stats.mtime.toISOString()
    if ( tmPrevModified == tmLastModified ) {
    //No change in file ignore            
        return;
    }
    //File modified            
    tmPrevModified = tmLastModified            
    const pipeRead = fs.createReadStream(cmn.defs.PIPE_ASAFE_TO_BB)
    let aryMsg = []
    pipeRead.on("data", (chunk) => aryMsg.push(chunk))
            .on("end", () => {
        if ( !(typeof aryMsg == "object" && aryMsg.length == 1) ) {
            return
        }        
        if ( blnVerbose == true ) {
            let intIdx = 0                
               ,intLength = aryMsg[intIdx++]
                         | (aryMsg[intIdx++] << 0x08)
                         | (aryMsg[intIdx++] << 0x10)
                         | (aryMsg[intIdx++] << 0x18)
            let aryData = aryMsg[0].slice(intIdx)         
               ,objReceived = JSON.parse(aryData)
//Display information about processed JSON
            cmn.displayStats(7, 42, objReceived)
        }
    });
}, cmn.defs.CHECK_PIPE_FREQUENCY)