/**
 * File:    a-safe.js
 * Notes:   Representation of A-Safe Application
 *          (C Application running on Beaglebone)
 * History:
 *  2021/03/16 Written by Simon Platten
 */
 'use strict'
 //Include modules
const cmn               = require("./incs/common")
const fs                = require("fs")
const { pipeline }      = require("stream")
//Display the application start-up message
cmn.titleBlock("A-Safe-Application demo", "1.00")
//Timer to check if PIPE has been modified
let blnVerbose = true, lngCApp = 0, tmLastModified, tmPrevModified
setInterval(() => {
    if ( fs.existsSync(cmn.defs.PIPE_BB_TO_ASAFE) != true ) {
        return
    }
    const stats = fs.statSync(cmn.defs.PIPE_BB_TO_ASAFE)
    tmLastModified = stats.mtime.toISOString()
    if ( tmPrevModified == tmLastModified ) {
    //No change in file ignore            
        return;
    }
    //File modified            
    tmPrevModified = tmLastModified            
    const pipeRead = fs.createReadStream(cmn.defs.PIPE_BB_TO_ASAFE)
    let aryChunks = []
    pipeRead.on("data", (chunk) => aryChunks.push(chunk))
            .on("end", () => {
        let strData = cmn.strCombineChunks(aryChunks)

        if ( !(typeof strData == "string" && strData.length > 0) ) {
            return
        }        
        let aryMsg = Buffer.from(strData), intIdx = 0                
            ,intLength = aryMsg[intIdx++]
                        | (aryMsg[intIdx++] << 0x08)
                        | (aryMsg[intIdx++] << 0x10)
                        | (aryMsg[intIdx++] << 0x18)
        let aryData = aryMsg.subarray(intIdx, aryMsg.length)  
           ,objReceived = JSON.parse(aryData)
        if ( typeof objReceived == "object" ) {
//Add information at this stage     
            objReceived.capp = {"reqNo": (++lngCApp)
                                ,"time": (new Date()).getTime()}                                         
            if ( blnVerbose == true ) {                               
//Display information about processed JSON
                cmn.displayStats(5, 42, objReceived)
            }
//Prepare JSON for transmission
            let aryResponse = cmn.aryPackageJSON(objReceived)
//Create PIPE                
            const pipeWrite = fs.createWriteStream(cmn.defs.PIPE_ASAFE_TO_BB)                
//Write message to it                
            pipeWrite.write(aryResponse)
        }
    });
}, cmn.defs.CHECK_PIPE_FREQUENCY)