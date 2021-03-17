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
let blnNextRequest = true, blnVerbose = true, objStats
   ,strCWD = path.dirname(__filename), tmLastModified
   ,tmPrevModified
//Start HTTPS server
cmn.httpServer(cmn.defs.PORT_BEAGLEBONE_LSTNG)      
//Display the application start-up message
cmn.titleBlock("BeagleBone", "1.00")
//Report profile folder
cmn.displayDataWithPrompt(5, 6, process.env.HOME, "Profile: ")
cmn.displayDataWithPrompt(6, 1, strCWD, "Current path: ")
//Timer to post to cloud
setInterval(() => {
    if ( blnNextRequest != true || typeof objStats != "object" ) {
    //Not ready for next request yet!
        return;
    }
    //Prevent timer from getting any further until this flag has been set to true
    blnNextRequest = false;
    let options = {"ca": cmn.fs.readFileSync("cert.pem")
 ,"checkServerIdentity": (host, cert) => {return undefined}
             ,"headers": {"Content-Type": "application/octet-stream"
                       ,"Content-Length": 0}
            ,"hostname": cmn.defs.HOST_BEAGLEBONE
              ,"method": "POST"
                ,"path": "/"
                ,"port": cmn.defs.PORT_BEAGLEBONE_LSTNG}
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
    //Create data to send        
    let txBuffer = Buffer.from(JSON.stringify(objStats))
    //Transmit buffer
    req.setHeader("Content-Length", txBuffer.length)    

    if ( req.write(txBuffer) == true && blnVerbose == true ) {        
    //Update statistics
        cmn.incCount(objStats, cmn.defs.JSON_BEAGLEBONE, cmn.defs.JSON_HTTP_POSTS_SENT)
    //Display information about processed JSON
        cmn.displayStats(7, 1, objStats)            
    }
    req.end()
}, cmn.defs.REQUEST_FREQUENCY);
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
                if ( blnVerbose == true ) {
                    let aryData = aryMsg[0].slice(cmn.defs.BYTES_IN_LENGTH)
                       ,objReceived = JSON.parse(aryData)
                    cmn.incCount(objStats, cmn.defs.JSON_BEAGLEBONE, cmn.defs.JSON_PIPES_READ)
                    for( let x in objReceived ) {
                        if ( x == "ASAFE" ) {
    //Transfer only the ASAFE data
                            objStats[x] = objReceived[x];
                            break;                          
                        }
                    }
                }
                pipeRead.close()
            });
        }
    }
    //Update the PIPE for data to ASAFE
    const pipeWrite = cmn.fs.createWriteStream(cmn.defs.PIPE_BB_TO_ASAFE)                
    //Ensure stats is initialised
    if ( objStats == undefined ) {
        objStats = {}
    }
    //Update statistics
    cmn.incCount(objStats, cmn.defs.JSON_BEAGLEBONE, cmn.defs.JSON_PIPES_SENT)
    //Forward message data to A-Safe application via pipe
    let aryMsg = cmn.aryPackageJSON(objStats)
    //Write message to pipe
    pipeWrite.write(aryMsg)
    //Close the pipe
    pipeWrite.close()
    if ( blnVerbose == true ) {   
    //Display information about processed JSON
        cmn.displayStats(7, 1, objStats)

        // cmn.displayDataWithPrompt(15, 1, "JSON:")        
        // console.dir(objStats)
    }
}, cmn.defs.PIPE_SERVICE_INTERVAL)
//Launch node instance for Cloud Node.JS Server 
// exec('node cloudsvr.js', (error, stdout, stderr) => {
//     console.log(stdout);
// });
// //Launch node instance for A-Safe Application (simulating C-App)
// exec('node a-safe.js', (error, stdout, stderr) => {
//     console.log(stdout);
// });