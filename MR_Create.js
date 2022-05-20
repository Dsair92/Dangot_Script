/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
 define(['N/search','N/file', 'N/runtime', 'N/format','N/record', 'N/task','N/currency'], function(search,file, runtime,format, record, task,currency) {
    var exports = {};


    function getInputData(){
        try{
            var data = [];
                var script = runtime.getCurrentScript();
                data = script.getParameter({ name: "custscript_data" });
                log.debug('data',data)
                log.debug({
                    title: 'Data Lengh',
                    details: data.length
                })
                return data
            }catch(e){log.debug({
                title: 'Error Data',
                details: e
            })}
            return 
                
    }
    function map(context){
        log.debug('Map Data',context.value)
    }
    function isNullOrEmpty(val) {
    if (typeof (val) == 'undefined' || val == null || (typeof (val) == 'string' && val.length == 0)) {
        return true;
    }
    return false;
    }

    function FormatDate(date)
    {
       var rawDateString = date;
       var parsedDate= format.parse({
           value: rawDateString,
           type: format.Type.DATE
    });
       return parsedDate
    }
              
    exports.getInputData = getInputData;
    exports.map = map;
    return exports;


}
);
   