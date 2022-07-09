/**
 * @NAPIVersion 2.x
 * @NscriptType ClientScript
 * @NmoduleScope SameAccount
 * 
 */

define(['N/record', 'N/error', 'N/search', 'N/format','N/ui/dialog','N/url', 'N/log'],
     function (record, error, search, format,dialog,url,log) {
        var exports = {};
        function fieldChanged(context) {
            try{
                rec = rec || scriptContext.currentRecord;
                var name = scriptContext.fieldId;
                log.debug("Field", name);
            }catch(e){
                log.debug('Error',e)
            }
        
        };
        exports.fieldChanged = fieldChanged;
        //exports.pageInit = pageInit;
        return exports;
    }
);