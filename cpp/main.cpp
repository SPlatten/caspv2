/**
 * File:    main.cpp
 * Notes:
 *  Work in progress for add on module for node.js 'caspv2'
 * History:
 *  2021/03/11 Written by Simon Platten
 */
//#define SIMPLE_EXAMPLE

#if defined(SIMPLE_EXAMPLE)
    #include <iostream>
    #include <napi.h>
    #include <string>
#else    
    #include "caspv2.h"

    //clsCASPv2::clsWorker* clsCASPv2::clsWorker::
#endif

#if defined(SIMPLE_EXAMPLE)
/**
 * Return "Hello " + user name passed back
 */
    Napi::String hello(const Napi::CallbackInfo& info) {
        Napi::Env env = info.Env();
        std::string strResult = "Hello ";
        strResult += info[0].ToString();
        return Napi::String::New(env, strResult);
    }
#endif
/**
 * Callback method when module is registered with Node.js
 */
Napi::Object Init(Napi::Env objEnv, Napi::Object objExports) {
#if defined(SIMPLE_EXAMPLE)        
    exports.Set(
        Napi::String::New(objEnv, "hello"),
        Napi::Function::New(objEnv, hello)
    );
#else
    clsCASPv2::init(objEnv, objExports);
#endif     
    return objExports;
}
NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init);