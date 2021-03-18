/**
 * File:    caspv2.h
 * Notes:   This file contains the prototype for the class
 *  clsCASPv2
 *
 * Methods:
 *  clsCASPv2       Constuctor
 *  ~clsCASPv2      Destructor
 *  strTitle        Access method to return module title
 *
 * Static Methods:
 *  init            Module initialisation
 *
 * Members:
 *
 * Static Members:
 *  msConstructor   NAPI function constructior
 *  mscszClassName  Literal name of class
 * 
 * History:
 * 2021/03/11 Written by Simon Platten
 */
 #if !defined(CLASS_CASPV2)
    #define CLASS_CASPV2
    
    #include <napi.h>

    class clsCASPv2 : public Napi::ObjectWrap<clsCASPv2> {
    private:
        static Napi::FunctionReference msConstructor;
        static const char mscszClassName[];

        Napi::Value init(const Napi::CallbackInfo& crobjCBInfo);
        Napi::Value queue(const Napi::CallbackInfo& crobjCBInfo);
        Napi::Value strTitle(const Napi::CallbackInfo& crobjCBInfo);

    protected:
        class clsWorker : public Napi::AsyncWorker {
        private:
            int mintInterval;
            int mintLength;
            int mintCount;
            std::vector<uint8_t> mvtruint8Data;

        protected:
            void Execute();
            void OnOK();

        public:
            static Napi::FunctionReference msrefEmit;
            static Napi::ObjectReference msrefThis;
            static clsWorker* mspWorker;

            clsWorker(Napi::Env objEnv, int intInterval)
                : Napi::AsyncWorker(objEnv), mintInterval(intInterval) {                    
            }
            ~clsWorker() {}

            void InitPerm(int intLength, int intCount) {
                mintLength = intLength;
                mintCount = intCount;
            }
        };

    public:
        static Napi::Object init(Napi::Env objEnv, Napi::Object objExports);

        clsCASPv2(const Napi::CallbackInfo& crobjCBInfo);
        ~clsCASPv2();
    };
#endif