/**
 * File:    common.js
 * Notes:   This file contains common utility
 * helper functions.
 *
 * Functions:
 *  aryHTTPSrx              Array of received HTTPS messages
 *  aryPackageJSON          Builds array from JSON object for sending
 *  clearError              Clears the error line
 *  connectTo               Create HTTPS connecto to supplied location and port
 *  displayDataWithPrompt   Display data with [optional] prompt
 *  displayError            Display error message
 *  incCount                Increment and update statistics
 *  registration            Registers stats and host
 *  setupHTTPSrx            Set-up HTTPS server for listening and receiving
 *  setupHTTPStx            Set-up HTTPS sevice to post data
 *  strCombineChunks        Combines passed array of data chunks
 *  strMoveCursor           Builds escape sequence to move to row and column
 *  strPadding              Create a string padded with leading characters
 *  titleBlock              Displays title block
 * 
 * Module variables:
 *  intRegStatsRow          Statistics top row, setup by registration
 *  intRegStatsCol          Statistics left column, setup by registration
 *  objHTTPStx              HTTPS TX object for HTTPS tx service
 *  objRegStats             Statistics object, setup by registration
 *  objRegRootKey           Root key into statistics, setup by registration
 *  tmrTO                   Timeout timer
 * 
 * History:
 *  2021/03/15 Written by Simon Platten
 */
 'use strict'
 //Include modules
const aryHTTPSrx = []
const defs          = require("./defs")
const fs            = require("fs")
const https         = require("https")
const { request }   = require("http")
let intRegStatsRow  = -1
   ,intRegStatsCol  = -1
   ,objHTTPStx      = null
   ,objRegStats     = null
   ,strRegRootKey   = null
   ,tmrRetryConn    = null
   ,tmrTO           = null
/**
 * @param objJSON JSON object to package
 * @returns Array prefixed with 32bit length of packet followed by data
 */
const aryPackageJSON = (objJSON) => {
    let aryExclude = [defs.JSON_LOCAL_TIME]
       ,objFiltered = {}
       ,fnFilter = (objJSON) => {
            let objFiltered = {}
            for( let x in objJSON ) {
                if ( aryExclude.indexOf(x) >= 0 ) {
    //This is in the filtered list, ignore it!                    
                    continue
                }
    //Not in exclusion list, is this another object?
                if ( typeof objJSON[x] == "object" ) {
    //Yes, filter the child
                    objFiltered[x] = fnFilter(objJSON[x])
                } else {
                    objFiltered[x] = objJSON[x]
                }
            }
            return objFiltered
       }
    objFiltered = fnFilter(objJSON)
    let asString = JSON.stringify(objFiltered)
       ,bufReceived = Buffer.from(asString)       
       ,aryMsg = new Uint8Array(bufReceived.length + defs.BYTES_IN_LENGTH)
       ,intIdx = 0
    aryMsg[intIdx++] = (bufReceived.length & 0xff)
    aryMsg[intIdx++] = (bufReceived.length >> 0x08) & 0xff
    aryMsg[intIdx++] = (bufReceived.length >> 0x10) & 0xff
    aryMsg[intIdx++] = (bufReceived.length >> 0x18) & 0xff
    while( intIdx < aryMsg.length ) {
        let bytValue = asString.charCodeAt(intIdx - defs.BYTES_IN_LENGTH)
        aryMsg[intIdx++] = bytValue
    }
    return aryMsg
}
/**
 * Clears the error line
 */
const clearError = () => {
    displayDataWithPrompt(defs.ERROR_ROW, 1, defs.BLANK_LINE)
}
/**
 * @param strServer Server URL / IP to connect to
 * @param intPort Port number to connect to
 * @param fnCallback Callback to perform on connection
 */
const connectTo = (strServer, intPort, fnCallback) => {
    let options =  {"ca": fs.readFileSync("cert.pem")
  ,"checkServerIdentity": (host, cert) => {return undefined}
              ,"headers": {"Content-Type": "application/octet-stream"
                        ,"Content-Length": 0}
             ,"hostname": strServer
               ,"method": defs.METHOD_POST
                 ,"path": "/"
                 ,"port": intPort}
    options.agent = new https.Agent(options)    
    let svr = https.request(options, (res) => {
    //For binary data we don't want any encoding                                       
        res.setEncoding(null)
        res.on("data", (chunk) => {
            console.log(chunk)
        })
    }).on("error", (error) => {
        displayError(error)
        if ( objRegStats != undefined && typeof strRegRootKey == "string" ) {
    //Increment error count        
            incCount(objRegStats, strRegRootKey, defs.JSON_HTTP_SEND_ERROR)
        }
        if ( tmrRetryConn == null ) {
    //Retry connection        
            tmrRetryConn = setTimeout(() => {
                connectTo(strServer, intPort, fnCallback)            
                tmrRetryConn = null
            }, defs.CONNECTION_RETRY)
        }
    })
    if ( typeof fnCallback == "function" ) {            
        fnCallback(svr)
    }
    return svr
}
/**
 * @param intRow Row number base 1
 * @param intCol Column number base 1
 * @param strData String containing data to display
 * @param strPrompt [optional] String containing prompt
 */
const displayDataWithPrompt = (intRow, intCol, strData, strPrompt) => {
    let strLine = ""
    if ( typeof intRow == "number" && typeof intCol == "number" ) {
        strLine += strMoveCursor(intRow, intCol);
    }
    if ( typeof strPrompt != "undefined" ) {
        strLine += strPrompt
    }
    if ( typeof strData != "undefined" ) {
        strLine += defs.BLUE + strData
    }
    if ( strLine.length > 0 ) {
        console.log(strLine + defs.RESET)
    }
}
/**
 * @param strError Error message to report
 */
const displayError = (strError) => {    
    let strFullMsg = (new Date()).toLocaleString() + " " + strError
    displayDataWithPrompt(defs.ERROR_ROW, 1, defs.RED + strFullMsg + defs.RESET)    
    
    if ( tmrTO != null ) {
        clearTimeout(tmrTO)
        tmrTO = null
    }
    tmrTO = setTimeout(() => {
        clearError()
    }, defs.CLEAR_ERROR_TIMEOUT)
}
/**
 * @param objStats Object containing statistics
 * @param strRootKey String specifying root key 
 * @param strSubKey String specifying sub key
 */
const incCount = (objStats, strRootKey, strSubKey) => {
    if ( !(typeof objStats == "object"
        && typeof strRootKey == "string"
        && typeof strSubKey == "string") ) {
        return;
    }
    if ( objStats[strRootKey] == undefined ) {
        objStats[strRootKey] = {}
    }
    if ( objStats[strRootKey][strSubKey] == undefined ) {
        objStats[strRootKey][strSubKey] = {}
        objStats[strRootKey][strSubKey][defs.JSON_CNT] = 0        
    }
    //Increment stats counter
    objStats[strRootKey][strSubKey][defs.JSON_CNT]++
    //Update timestamp
    objStats[strRootKey][strSubKey][defs.JSON_TIME] = (new Date()).getTime()
}
/**
 * @param objStats Statistics object for local application
 * @param strRootKey Root key to access statistics
 * @param intStatsRow First row for statistics display
 * @param intStatsCol First column for statistics display
 */
const registration = (objStats, strRootKey, intStatsRow, intStatsCol) => {
    if ( typeof objStats == "object" ) {
        objRegStats = objStats
    }
    if ( typeof strRootKey == "string" ) {
        strRegRootKey = strRootKey
    }
    if ( typeof intStatsRow == "number" ) {
        intRegStatsRow = intStatsRow
    }
    if ( typeof intStatsCol == "number" ) {
        intRegStatsCol = intStatsCol
    }    
    //Set-up timer to update local date / time
    setInterval(() => {
    //Update local time
        let dtNow = new Date()
           ,intTime = dtNow.getTime()
           ,strTime = dtNow.toLocaleString() + "." + dtNow.getMilliseconds()           
        objRegStats[strRegRootKey][defs.JSON_LOCAL_TIME] = intTime
        displayDataWithPrompt(intRegStatsRow, 1
                ,strTime, defs.JSON_LOCAL_TIME + ": ")
    //Update all the statistics on the display                
        const colOffsets    = "colOffsets"
        const keys          = "keys"
        const title         = "title"
        const tmPosOffset   = 32
        let aryNodes = [defs.JSON_ASAFE, defs.JSON_BEAGLEBONE, defs.JSON_CLOUD]
        let intCol = intRegStatsCol, intRow = intRegStatsRow
        let objAsafe = {colOffsets: [2, 2]
                             ,keys: [defs.JSON_PIPE_READ
                                    ,defs.JSON_PIPE_CREATED]                             
                            ,title: "A-Safe Application"}
        let objBeagleBone = {colOffsets: [2, 2, 2, 2, 2, 2]
                                  ,keys: [defs.JSON_PIPE_READ
                                         ,defs.JSON_PIPE_CREATED
                                         ,defs.JSON_HTTP_POSTS_READ
                                         ,defs.JSON_HTTP_POSTS_SENT
                                         ,defs.JSON_HTTP_READ_ERROR
                                         ,defs.JSON_HTTP_SEND_ERROR]
                                 ,title: "BeagleBone NodeJS Server"}
        let objCloud = {colOffsets: [2, 2, 2, 2]
                             ,keys: [defs.JSON_HTTP_POSTS_READ
                                    ,defs.JSON_HTTP_POSTS_SENT
                                    ,defs.JSON_HTTP_READ_ERROR
                                    ,defs.JSON_HTTP_SEND_ERROR]
                            ,title: "Cloud NodeJS Server"}
        let strLastTitle   
        for( let n=0; n<aryNodes.length; n++ ) {
            let strNode = aryNodes[n], objNode
            if ( strNode == defs.JSON_ASAFE ) {
                objNode = objAsafe
            } else if ( strNode == defs.JSON_BEAGLEBONE ) {
                objNode = objBeagleBone
            } else if ( strNode == defs.JSON_CLOUD ) {
                objNode = objCloud
            } else {
                continue
            }
            let objSection = objRegStats[strNode]
            if ( typeof objSection != "object" ) {
                continue
            }
            for( let k=0; k<objNode[keys].length; k++ ) {
                let strKey = objNode[keys][k]
                if ( !(typeof strKey == "string" && strKey.length > 0) ) {
                    continue
                }
                let objData = objSection[strKey]
                if ( typeof objData == "undefined" ) {
                    continue
                }                       
                if ( strLastTitle != objNode[title] ) {
                    strLastTitle = objNode[title]
                    displayDataWithPrompt(++intRow, intCol, "", objNode[title])
                }
                displayDataWithPrompt(++intRow, intCol + objNode[colOffsets][k]
                    ,objData[defs.JSON_CNT], strKey + ": ")
                let dtTime = new Date(objData[defs.JSON_TIME])
                   ,strTime = dtTime.toLocaleString() + "." + dtTime.getMilliseconds()
                displayDataWithPrompt(intRow, intCol + tmPosOffset
                    ,strTime, defs.JSON_TIME + ": ")            
            }
        }
    }, defs.UPDATE_LOCAL_TIME)    
}
/**
 * @param strRootKey String specifying root key 
 * @param strSubKey String specifying sub key
 * @param strHost String containing host name
 * @param intPort Port to listen to
 */
const setupHTTPSrx = (strRootKey, strSubKey, strHost, intPort) => {
    if ( !(typeof strRootKey == "string"
        && typeof strSubKey == "string"
        && typeof strHost == "string"
        && typeof intPort == "number") ) {
        return;            
    }
    let options = {"ca": fs.readFileSync("cert.pem")
 ,"checkServerIdentity": (host, cert) => {return undefined}
             ,"headers": {"Content-Type": "application/json"
                         ,"Content-Length": 0}
            ,"hostname": strHost
              ,"method": defs.METHOD_POST
                ,"path": "/"
                ,"port": intPort}
    options.agent = new https.Agent(options)
    let rxHTTPS = https.createServer({key:fs.readFileSync("key.pem")
                                     ,cert:fs.readFileSync("cert.pem")}
                                     ,(res) => {
        res.on("data", (d) => {         
            if ( !(objRegStats != undefined && typeof strRegRootKey == "string") ) {
                return
            }
            let aryBytes = new Uint8Array(d)
              ,intLength = aryBytes[0] 
                         | (aryBytes[1] << 0x08)
                         | (aryBytes[2] << 0x10)
                         | (aryBytes[3] << 0x18)  
              ,objBuffer = Buffer.from(aryBytes)
        //Compare encoded length with actual length, update statistics
            if ( intLength == aryBytes.length - defs.BYTES_IN_LENGTH ) {
                incCount(objRegStats, strRootKey, strSubKey)
            } else {
                incCount(objRegStats, strRootKey, defs.JSON_HTTP_READ_ERROR)
            }
        });
    }).listen(intPort)    
}
/**
 * @param strRootKey String specifying root key 
 * @param strSubKey String specifying sub key
 * @param strHost String containing host name
 * @param intPort Port to listen to
 */
 const setupHTTPStx = (strRootKey, strSubKey, strHost, intPort) => {
    if ( !(typeof strRootKey == "string"
        && typeof strSubKey == "string"
        && typeof strHost == "string"
        && typeof intPort == "number") ) {
        return;            
    }
    if ( objHTTPStx == null ) {
    //Create object to manage service
        objHTTPStx = {"res":null}
    //Create callback function to perform whilst connected        
        let fnCallback = (req) => {
    //Construct array from JSON            
            let aryJSON = aryPackageJSON(objRegStats)
    //Convert data to Buffer for transmission
            let buffer = Buffer.from(aryJSON)
    //Set correct content length
            req.setHeader(defs.HDR_CONTENT_LENGTH, buffer.length)
    //Send data
            req.end(buffer)
    //Update statistics
            incCount(objRegStats, strRegRootKey, defs.JSON_HTTP_POSTS_SENT)
        }
    //Set-up HTTPS tx service object        
        objHTTPStx["tmr"] = setInterval(() => {
            if ( objHTTPStx["res"] == null ) {
    //Create dummy "res" to let timer know we are busy trying to connect
                objHTTPStx["res"] = "Dummy!"                
    //Set up timeout to allow another TX
                setTimeout(() => {
                    objHTTPStx["res"] = null
                }, defs.POST_TIMEOUT)             
    //Only when "res" is null do we create a new connection                
                objHTTPStx["res"] = connectTo(strHost, intPort, (req) => {
                    fnCallback(req)
                })
                if ( objHTTPStx["res"] != undefined ) {
                    objHTTPStx["res"].on("error", (error) => {
                        displayError(error)
                    })                
                }
            }
        }, defs.HTTP_SERVICE_INTERVAL);
    }
}
/**
 * @param aryChunks Array of chunks to combine
 * @return String result of combine chunks
 */
 const strCombineChunks = (aryChunks) => {
    if ( !(typeof aryChunks == "object"
        && typeof aryChunks.length == "number" 
        && aryChunks.length > 0) ) {        
        return
    }
    return Buffer.concat(aryChunks).toString()
}
/**
 * @param intRow Rw number base 1
 * @param intCol Column number base 1
 * @returns Escape sequence to move to supplied row and column
 */
const strMoveCursor = (intRow, intCol) => {
    return defs.ANSI + String(intRow) + ";" + String(intCol) + "H";
}
/**
 * @param intWidth Ttotal length of padding required
 * @param cPadding Character to pad with
 * @return String of specified width containing multiples of padding char
 */
const strPadding = (intWidth, cPadding) => {
    if ( !(typeof intWidth == "number" && intWidth > 0
        && typeof cPadding == "string" && cPadding.length == 1) ) {
        return
    }
    let strPadded = ""
    for( let p=0; p<intWidth; p++ ) {
        strPadded += cPadding
    }
    return strPadded
}
/**
 * @param strTitle Title to display
 * @param strVerion Version number
 * @return Next available row after title block
 */
const titleBlock = (strTitle, strVersion) => {
    let aryLines = [
        strTitle + " for NODE.js, version " + strVersion + ", PID: " 
                                                         + process.pid,
        "Written by Simon A. Platten of Syberdyne Systems Ltd",
        "Today's date: " + (new Date()).toLocaleDateString("en-GB")
    ], strSeperator = strPadding(defs.DISP_WIDTH, "*")
    let intRow = 1
    displayDataWithPrompt(intRow++, 1
        ,defs.CLRSCR + defs.GREEN + strSeperator + defs.YELLOW)
    for( let l=0; l<aryLines.length; l++ ) {    
        displayDataWithPrompt(intRow++, 1
            ,strPadding((defs.DISP_WIDTH - aryLines[l].length) / 2, ' ')
            + aryLines[l])
    }
    displayDataWithPrompt(intRow++, 1, defs.GREEN + strSeperator + defs.RESET)    
    return intRow
}
try{
    if ( exports !== undefined ) {
        exports.aryHTTPSrx              = aryHTTPSrx
        exports.defs                    = defs
        exports.fs                      = fs
        exports.https                   = https
        exports.aryPackageJSON          = aryPackageJSON
        exports.connectTo               = connectTo
        exports.displayDataWithPrompt   = displayDataWithPrompt
        exports.displayError            = displayError
        exports.incCount                = incCount
        exports.registration            = registration
        exports.setupHTTPSrx            = setupHTTPSrx
        exports.setupHTTPStx            = setupHTTPStx
        exports.strCombineChunks        = strCombineChunks
        exports.strMoveCursor           = strMoveCursor
        exports.strPadding              = strPadding
        exports.titleBlock              = titleBlock
    }
  } catch( ex ) {
  //Client side
    //console.log("defs.js, client side: " + ex);
  }