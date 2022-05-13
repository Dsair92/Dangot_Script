/**
 * @NAPIVersion 2.x
 * @NscriptType UserEventScript
 * @NmoduleScope SameAccount
 * 
 */

 define(['N/record', 'N/error', 'N/search', 'N/format','N/ui/dialog','N/url','N/task', 'N/log'],
 function (record, error, search, format,dialog,url,task,log) {
        

        var exports = {};
        /**
         * 
         * 
         * @param {Object} Context
         * @param {Record} Context.newRecord - New record
         * @param {string} Context.type - Trigger type
         * @param {Form} Context.form - Current form
         *   
         */
        function afterSubmit(Context) {
                var type = Context.type
                var RecID = Context.newRecord.id
                var Rec = Context.newRecord
                    /*record.load({
                    type: 'itemfulfillment',
                    id: RecID,
                    isDynamic: true,
                    })
                    */
                    var numLines = Rec.getLineCount({
                        sublistId: 'component'
                    });
                    log.debug({
                        title: 'Lines',
                        details: numLines
                    })
                }
               
        

    
    

     
        exports.afterSubmit = afterSubmit;
        //exports.pageInit = pageInit;
        return exports;


        }
    
);
   