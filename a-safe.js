/**
 * File:    a-safe.js
 * Notes:   Representation of A-Safe Application
 *          (C Application running on Beaglebone)
 * History:
 *  2021/03/16 Written by Simon Platten
 */
 'use strict'
 //Include modules
const cmn = require("./incs/common")
//Display the application start-up message
cmn.titleBlock("A-Safe-Application demo", "1.00")
//Timer to check if PIPE has been modified
let objStats = {}, tmLastModified, tmPrevModified
//Register this node
objStats[cmn.defs.JSON_ASAFE] = {}
cmn.registration(objStats, cmn.defs.JSON_ASAFE, 5, 1)
//Timer to read pipe from BeagleBone and Create Pipe
setInterval(() => {
    if ( cmn.fs.existsSync(cmn.defs.PIPE_BB_TO_ASAFE) != true ) {
        return
    }
    const stats = cmn.fs.statSync(cmn.defs.PIPE_BB_TO_ASAFE)
    tmLastModified = stats.mtime.toISOString()
    if ( tmPrevModified == tmLastModified ) {
    //No change in file ignore            
        return;
    }
    //File modified            
    tmPrevModified = tmLastModified            
    const pipeRead = cmn.fs.createReadStream(cmn.defs.PIPE_BB_TO_ASAFE)
    let aryChunks = []
    pipeRead.on("data", (chunk) => aryChunks.push(chunk))
            .on("end", () => {
        let strData = cmn.strCombineChunks(aryChunks)
        if ( !(typeof strData == "string" && strData.length > 0) ) {
            return
        }        
        let aryData = strData.slice(cmn.defs.BYTES_IN_LENGTH)
           ,objReceived = JSON.parse(aryData)
        if ( typeof objReceived == "object" ) {
    //Update statistics            
            cmn.incCount(objStats, cmn.defs.JSON_ASAFE, cmn.defs.JSON_PIPE_READ)
    //Prepare JSON for transmission
            let aryResponse = cmn.aryPackageJSON(objStats)
    //Create PIPE                
            const pipeWrite = cmn.fs.createWriteStream(cmn.defs.PIPE_ASAFE_TO_BB)                
    //Write message to it                
            pipeWrite.write(aryResponse)
    //Close the pipe
            pipeWrite.close()
    //Update statistics            
            cmn.incCount(objStats, cmn.defs.JSON_ASAFE, cmn.defs.JSON_PIPE_CREATED)
        }
    });
}, cmn.defs.CHECK_PIPE_FREQUENCY)