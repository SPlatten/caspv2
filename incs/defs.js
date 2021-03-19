/**
 * File:
 *  defs.js
 *  
 * Notes:
 *  Server side constant definitions  
 *  
 * History:
 *  2021/03/12 Written by Simon Platten
 */
//Constants
const ANSI_PREFIX           = "\u001b["
     ,BYTES_IN_LENGTH       = 4
     ,CLEAR_ERROR_TIMEOUT   = 3000
     ,CONNECTION_RETRY      = 5000
     ,CRLF                  = "\r\n"
     ,DISP_WIDTH            = 80
     ,BLANK_LINE            = " ".padStart(DISP_WIDTH, " ")
     ,ERROR_ROW             = 16
     ,HDR_CONTENT_LENGTH    = "Content-Length"
     ,HOST_BEAGLEBONE       = "localhost"
     ,HOST_CLOUD            = "localhost"     
     ,HTTP_SERVICE_INTERVAL = 1
     ,JSON_ASAFE            = "A-SAFE"
     ,JSON_BEAGLEBONE       = "beagleBone"
     ,JSON_CLOUD            = "cloud"     
     ,JSON_CNT              = "cnt"
     ,JSON_HTTP_POSTS_READ  = " HTTPS Posts Read"
     ,JSON_HTTP_POSTS_SENT  = " HTTPS Posts Sent"
     ,JSON_HTTP_READ_ERROR  = " HTTPS Read Error"
     ,JSON_HTTP_SEND_ERROR  = " HTTPS Send Error"
     ,JSON_LOCAL_TIME       = "Local system Time"
     ,JSON_PIPE_CREATED     = "     Pipe Created"
     ,JSON_PIPE_READ        = "        Pipe Read"
     ,JSON_TIME             = "Time"
     ,METHOD_GET            = "GET"
     ,METHOD_POST           = "POST"
     ,PIPE_ASAFE_TO_BB      = "./asafe-bb.file"
     ,PIPE_BB_TO_ASAFE      = "./bb-asafe.file"
     ,PIPE_SERVICE_INTERVAL = 1
     ,PORT_BEAGLEBONE_LSTNG = 8000
     ,PORT_CLOUD_SERVER     = 8001
     ,POST_TIMEOUT          = 500
     ,STATUS_ROW            = 14
     ,RED                   = ANSI_PREFIX + "31m" 
     ,GREEN                 = ANSI_PREFIX + "32m" 
     ,YELLOW                = ANSI_PREFIX + "33m"
     ,BLUE                  = ANSI_PREFIX + "34m"
     ,MAGENTA               = ANSI_PREFIX + "35m"
     ,CYAN                  = ANSI_PREFIX + "36m" 
     ,RESET                 = ANSI_PREFIX + "0m"
     ,CLRSCR                = ANSI_PREFIX + "2J" + ANSI_PREFIX + "0;0f"
     ,RESTCP                = ANSI_PREFIX + "u"
     ,SAVECP                = ANSI_PREFIX + "s"
     ,UPDATE_LOCAL_TIME     = 500

try{
  if ( exports !== undefined ) {
    exports.ANSI                  = ANSI_PREFIX
    exports.BYTES_IN_LENGTH       = BYTES_IN_LENGTH
    exports.CLEAR_ERROR_TIMEOUT   = CLEAR_ERROR_TIMEOUT
    exports.CONNECTION_RETRY      = CONNECTION_RETRY
    exports.CRLF                  = CRLF
    exports.DISP_WIDTH            = DISP_WIDTH
    exports.BLANK_LINE            = BLANK_LINE
    exports.ERROR_ROW             = ERROR_ROW
    exports.HDR_CONTENT_LENGTH    = HDR_CONTENT_LENGTH
    exports.HOST_BEAGLEBONE       = HOST_BEAGLEBONE
    exports.HOST_CLOUD            = HOST_CLOUD
    exports.HTTP_SERVICE_INTERVAL = HTTP_SERVICE_INTERVAL
    exports.JSON_ASAFE            = JSON_ASAFE
    exports.JSON_BEAGLEBONE       = JSON_BEAGLEBONE
    exports.JSON_CLOUD            = JSON_CLOUD
    exports.JSON_CNT              = JSON_CNT
    exports.JSON_HTTP_POSTS_READ  = JSON_HTTP_POSTS_READ
    exports.JSON_HTTP_POSTS_SENT  = JSON_HTTP_POSTS_SENT
    exports.JSON_HTTP_READ_ERROR  = JSON_HTTP_READ_ERROR
    exports.JSON_HTTP_SEND_ERROR  = JSON_HTTP_SEND_ERROR
    exports.JSON_LOCAL_TIME       = JSON_LOCAL_TIME
    exports.JSON_PIPE_CREATED     = JSON_PIPE_CREATED
    exports.JSON_PIPE_READ        = JSON_PIPE_READ
    exports.JSON_TIME             = JSON_TIME
    exports.METHOD_GET            = METHOD_GET
    exports.METHOD_POST           = METHOD_POST
    exports.PIPE_ASAFE_TO_BB      = PIPE_ASAFE_TO_BB
    exports.PIPE_BB_TO_ASAFE      = PIPE_BB_TO_ASAFE
    exports.PIPE_SERVICE_INTERVAL = PIPE_SERVICE_INTERVAL
    exports.PORT_BEAGLEBONE_LSTNG = PORT_BEAGLEBONE_LSTNG
    exports.PORT_CLOUD_SERVER     = PORT_CLOUD_SERVER
    exports.POST_TIMEOUT          = POST_TIMEOUT
    exports.STATUS_ROW            = STATUS_ROW
    exports.RED                   = RED
    exports.GREEN                 = GREEN
    exports.YELLOW                = YELLOW
    exports.BLUE                  = BLUE
    exports.MAGENTA               = MAGENTA
    exports.CYAN                  = CYAN
    exports.RESET                 = RESET
    exports.CLRSCR                = CLRSCR
    exports.RESTCP                = RESTCP
    exports.SAVECP                = SAVECP
    exports.UPDATE_LOCAL_TIME     = UPDATE_LOCAL_TIME
  }
} catch( ex ) {
  //console.log("defs.js, Exception: " + ex);
}      