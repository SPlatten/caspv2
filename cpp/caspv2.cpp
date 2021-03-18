/**
 * File:    caspv2.cpp
 * Notes:   This file contains the implementation for the class
 *  clsCASPv2 
 * History:
 * 2021/03/11 Written by Simon Platten
 */
 #include "caspv2.h"

 #include <thread>
 #include <chrono>
 #include <ctime>
 #include <cstdlib>
//Static initialisation
clsCASPv2::clsWorker* clsCASPv2::clsWorker::mspWorker = nullptr;
Napi::FunctionReference clsCASPv2::clsWorker::msrefEmit;
Napi::ObjectReference clsCASPv2::clsWorker::msrefThis;
const char clsCASPv2::mscszClassName[] = "clsCASPv2";
Napi::FunctionReference clsCASPv2::msConstructor;
/**
 * @brief;  Constructor
 * @param:  crobjInfo : Constant reference to callback information
 */
clsCASPv2::clsCASPv2(const Napi::CallbackInfo& crobjInfo)
        : Napi::ObjectWrap<clsCASPv2>(crobjInfo) {
    Napi::Env objEnv = crobjInfo.Env();
    Napi::Object _this = crobjInfo.This().As<Napi::Object>();
    Napi::Function _emit = _this.Get("emit").As<Napi::Function>();
    int intInterval = crobjInfo[0].As<Napi::Number>().Int32Value();
    clsCASPv2::clsWorker* pWorker = new clsCASPv2::clsWorker(objEnv, intInterval);
    pWorker->SuppressDestruct();
    clsCASPv2::clsWorker::msrefThis = Napi::Persistent(_this);
    clsCASPv2::clsWorker::msrefThis.SuppressDestruct();
    clsCASPv2::clsWorker::msrefEmit = Napi::Persistent(_emit);
    clsCASPv2::clsWorker::msrefEmit.SuppressDestruct();
    clsCASPv2::clsWorker::mspWorker = pWorker;
}
/**
 * @brief:  Destructor
 */
clsCASPv2::~clsCASPv2() {
   delete clsCASPv2::clsWorker::mspWorker;
   clsCASPv2::clsWorker::mspWorker = nullptr;
}
/**
 * @brief:  init
 * @param:  objEnv : Object containing environment information
 * @param:  objExports : Object containing export information
 * @return: results of initialsation
 */
Napi::Object clsCASPv2::init(Napi::Env objEnv, Napi::Object objExports) {
    Napi::HandleScope scope(objEnv);
    Napi::Function func = DefineClass(objEnv, clsCASPv2::mscszClassName, {        
        InstanceMethod<&clsCASPv2::init>("init"),
        InstanceMethod<&clsCASPv2::queue>("queue"),
        InstanceMethod<&clsCASPv2::strTitle>("title")
    });
    clsCASPv2::msConstructor = Napi::Persistent(func);
    clsCASPv2::msConstructor.SuppressDestruct();
    objExports.Set(clsCASPv2::mscszClassName, func);
    return objExports;
}
/**
 * @brief: init
 * @param: crobjCBInfo : Constant reference to call back information
 * @return: value
 */
Napi::Value clsCASPv2::init(const Napi::CallbackInfo& crobjCBInfo) {
    int intLength = crobjCBInfo[0].As<Napi::Number>().Int32Value();
    int intCount = crobjCBInfo[1].As<Napi::Number>().Int32Value();
    clsCASPv2::clsWorker::mspWorker->InitPerm(intLength, intCount);
    return crobjCBInfo.Env().Undefined();
}
/**
 * @brief: query
 * @param: crobjCBInfo : Constant reference to call back information
 * @return: value
 */
Napi::Value clsCASPv2::queue(const Napi::CallbackInfo& crobjCBInfo) {
    clsCASPv2::clsWorker::mspWorker->Queue();
    return crobjCBInfo.Env().Undefined();
}
/**
 * @brief:  strTitle
 * @param: crobjCBInfo : Constant reference to call back information
 * @return: Title of module
 */
Napi::Value clsCASPv2::strTitle(const Napi::CallbackInfo& crobjCBInfo) {
    Napi::Env env = crobjCBInfo.Env();
    std::string strResult = "CASP v2";
    return Napi::String::New(env, strResult);
}
/**
 */
void clsCASPv2::clsWorker::Execute() {
    std::this_thread::sleep_for(std::chrono::seconds(mintInterval));
    std::srand(time(nullptr));
    mvtruint8Data.clear();

    for( int i=0; i<mintLength; i++ ) {
        uint8_t intRData = rand() % 0x100;
        mvtruint8Data.push_back(intRData);
    }
}
/**
 */
void clsCASPv2::clsWorker::OnOK() {
    Napi::Function funEmit = clsCASPv2::clsWorker::msrefEmit.Value();
    Napi::Object objThis =  clsCASPv2::clsWorker::msrefThis.Value();
    Napi::Env env = Env();
    Napi::HandleScope scope(env);

    if ( mvtruint8Data.size() ) {
        funEmit.Call(objThis, {
            Napi::String::New(env, "data"),
            Napi::Buffer<uint8_t>::Copy(env, mvtruint8Data.data(), mvtruint8Data.size()),
            Napi::Number::New(env, mintLength)
        });
    }
    if ( --mintCount ) {
        clsCASPv2::clsWorker::mspWorker->Queue();
    }
}