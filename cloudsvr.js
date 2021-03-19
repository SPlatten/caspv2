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
const { CYAN } = require("./incs/defs")
//Display the application start-up message
let intFirstRow = cmn.titleBlock("Cloud NodeJS Server", "1.00")
   ,objStats = {}
//Register this node
objStats[cmn.defs.JSON_CLOUD] = {}
cmn.registration(objStats, cmn.defs.JSON_CLOUD, intFirstRow, 1)
//Set-up service to receive HTTPS 'POST'ed data
cmn.setupHTTPSrx(cmn.defs.JSON_CLOUD
                ,cmn.defs.JSON_HTTP_POSTS_READ
                ,cmn.defs.HOST_CLOUD
                ,cmn.defs.PORT_CLOUD_SERVER)
//Set-up service to post HTTPS data
cmn.setupHTTPStx(cmn.defs.JSON_CLOUD
                ,cmn.defs.JSON_HTTP_POSTS_SENT
                ,cmn.defs.HOST_BEAGLEBONE
                ,cmn.defs.PORT_BEAGLEBONE_LSTNG)  