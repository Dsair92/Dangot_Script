/**
 * @NAPIVersion 2.x
 * @NscriptType UserEventScript
 * @NmoduleScope SameAccount
 * 
 */

 define(['N/record', 'N/error', 'N/search', 'N/format','N/ui/dialog','N/url', 'N/log'],
 function (record, error, search, format,dialog,url,log) {
        

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
        function afterSubmit(scriptContext) {
                var type = scriptContext.type
                if (type == 'edit' || type =='create' ) {
                var newrec = scriptContext.newRecord
                var recid = newrec.id
                var ShipStatus = recid.getValue('defaultshipstage')
                log.debug({
                    title: 'Shipstatus',
                    details: ShipStatus
                })
                
                if(ShipStatus=='C'){}
               
        }

    }
    

     
        exports.afterSubmit = afterSubmit;
        //exports.pageInit = pageInit;
        return exports;


        }
    
);
   