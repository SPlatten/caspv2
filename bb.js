/**
 * File:    bb.js
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
const cmn           = require("./incs/common")
const exec          = require("child_process").exec
const path          = require("path")
//Display the application start-up message
cmn.titleBlock("BeagleBone", "1.00")
//Set-up variables
let blnNextHTTPpost = true, objStats = {}, options
   ,strCWD = path.dirname(__filename)
   ,tmLastModified, tmPrevModified, txBuffer
//Register this node
objStats[cmn.defs.JSON_BEAGLEBONE] = {}
cmn.registration(objStats, cmn.defs.JSON_BEAGLEBONE, 7, 1)
//Remove any existing pipe files
cmn.fs.unlinkSync(cmn.defs.PIPE_ASAFE_TO_BB)
cmn.fs.unlinkSync(cmn.defs.PIPE_BB_TO_ASAFE)
//Report profile folder
cmn.displayDataWithPrompt(5, 6, process.env.HOME, "Profile: ")
cmn.displayDataWithPrompt(6, 1, strCWD, "Current path: ")
//Set-up service to receive HTTPS 'POST'ed data
cmn.setupHTTPSrx(cmn.defs.JSON_BEAGLEBONE
                ,cmn.defs.JSON_HTTP_POSTS_READ
                ,cmn.defs.HOST_BEAGLEBONE
                ,cmn.defs.PORT_BEAGLEBONE_LSTNG) 
//Set-up service to post HTTPS data    
cmn.setupHTTPStx(cmn.defs.JSON_BEAGLEBONE
                ,cmn.defs.JSON_HTTP_POSTS_SENT
                ,cmn.defs.HOST_CLOUD
                ,cmn.defs.PORT_CLOUD_SERVER)          
//Timer to service PIPES
setInterval(() => {
    if ( typeof objStats == "object" && typeof objStats.beagleBone == "object"
      && cmn.fs.existsSync(cmn.defs.PIPE_ASAFE_TO_BB) == true ) {
        const stats = cmn.fs.statSync(cmn.defs.PIPE_ASAFE_TO_BB)
        tmLastModified = stats.mtime.toISOString()
        
        if ( tmPrevModified != tmLastModified ) {
    //File has been modified, update modified timestamp
           tmPrevModified = tmLastModified             
    //Read file content
            const pipeRead = cmn.fs.createReadStream(cmn.defs.PIPE_ASAFE_TO_BB)
            let aryMsg = []
            pipeRead.on("data", (chunk) => aryMsg.push(chunk))
                    .on("end", () => {
                if ( !(typeof aryMsg == "object" && aryMsg.length == 1) ) {
                    return
                }        
                let aryData = aryMsg[0].slice(cmn.defs.BYTES_IN_LENGTH)
                    ,objReceived = JSON.parse(aryData)
    //Update statistics                       
                cmn.incCount(objStats, cmn.defs.JSON_BEAGLEBONE, cmn.defs.JSON_PIPE_READ)
                for( let x in objReceived ) {
                    if ( x == "ASAFE" ) {
    //Transfer only the ASAFE data
                        objStats[x] = objReceived[x];
                        break;                          
                    }
                }
                pipeRead.close()
            });
        }
    }
    //Update the PIPE for data to ASAFE
    const pipeWrite = cmn.fs.createWriteStream(cmn.defs.PIPE_BB_TO_ASAFE)                
    //Update statistics
    cmn.incCount(objStats, cmn.defs.JSON_BEAGLEBONE, cmn.defs.JSON_PIPE_CREATED)
    //Forward message data to A-Safe application via pipe
    let aryMsg = cmn.aryPackageJSON(objStats)
    //Write message to pipe
    pipeWrite.write(aryMsg)
    //Close the pipe
    pipeWrite.close()
}, cmn.defs.PIPE_SERVICE_INTERVAL)
//Launch node instance for Cloud Node.JS Server 
// exec('node cloudsvr.js', (error, stdout, stderr) => {
//     console.log(stdout);
// });
// //Launch node instance for A-Safe Application (simulating C-App)
// exec('node a-safe.js', (error, stdout, stderr) => {
//     console.log(stdout);
// });