/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
 define(['N/ui/serverWidget','N/record','N/file'],
function (serverWidget,record,file) {
    function beforeLoad(context) {
        
    }
    function afterSubmit(context) {
        try {
            if (context.type != context.UserEventType.DELETE){
                var rec = context.newRecord;
                var recfile = rec.getValue('custrecord_ib_c_file')
                if (!isNullOrEmpty(recfile)) {
                    var File = file.load(recfile)
                    var header = false
                    var Data = []
                    var iterator = File.lines.iterator();
                    iterator.each(function (line) {
                        var linevalue = line.value.split(',')
                        if (!header) {
                            header = true
                        }
                        else {
                            Data.push(linevalue)
            
                        }
                        return true
                    })
                    log.debug({
                        title: 'File',
                        details: Data
                    })
                }
            }

        } catch (e) { }
    }
    function isNullOrEmpty(val) {

        if (typeof (val) == 'undefined' || val == null || (typeof (val) == 'string' && val.length == 0)) {
            return true;
        }
        return false;
    }
    return {
        afterSubmit: afterSubmit
    };
});