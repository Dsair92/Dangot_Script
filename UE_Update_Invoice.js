/**
 * @NAPIVersion 2.0
 * @NscriptType UserEventScript
 * @NmoduleScope SameAccount
 * 
 */

 define(['N/record', 'N/error', 'N/search', 'N/format','N/task', 'N/log'],
 function (record, error, search, format, task,log) {
        

     function beforeload(context) {
        var Record = context.newRecord;
        var Created_From  = Record.getValue('createdfrom');
        if (!isNullOrEmpty(Created_From)){
            var Lines = Record.getLineCount('item');
            var Currency = Record.getValue('currency')
            if (Lines > 0){
                for (var i = 0; i < Lines; i++){
                    var Item_Currency = Record.getSublistValue({  sublistId: 'item',fieldId: 'custcol_item_currency',line: i})
                    log.debug('Item Currency',Item_Currency)

                }
            }
            
        }
        return         
    };
    function isNullOrEmpty(val) {
        if (typeof (val) == 'undefined' || val == null || (typeof (val) == 'string' && val.length == 0)) {
            return true;
        }
        return false;
    }

     return {
         beforeLoad: beforeload,
         //beforeSubmit: beforesubmit,
         //afterSubmit: afersubmit
     };

}
);
   