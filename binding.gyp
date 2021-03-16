{
    "targets":  [
        {
            "target_name":  "caspv2",
            "sources":      [
                "cpp/main.cpp",
                "cpp/caspv2.cpp"
            ],
            "cflags!":      [
                "-fno-exceptions"
            ],
            "cflags_cc!":   [
                "-fno-exceptions"
            ],
            "include_dirs": [
                "<!@(node -p \"require('node-addon-api').include\")"
            ],
            "dependencies": [
                "<!(node -p \"require('node-addon-api').gyp\")"
            ],
            "libraries":    [],
            "defines":      [
                "NAPI_DISABLE_CPP_EXCEPTIONS"
            ],
            'conditions':   [
                [   'OS=="win"'
                    ,{
                        "msvs_settings": {
                            "VCCLCompilerTool": { 
                                "ExceptionHandling": 1
                            }
                        }
                    }
                ]
            ]        
        }
    ]
}