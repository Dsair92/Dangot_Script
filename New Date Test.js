/**
 * @NAPIVersion 2.x
 * @NscriptType UserEventScript
 * @NmoduleScope SameAccount
 * 
 */

 define(['N/record', 'N/error', 'N/search', 'N/format','N/ui/dialog','N/url', 'N/log'],
 function (record, error, search, format,dialog,url,log) {
        

        var exports = {};
      
        function afterSubmit(context) {
                var type = context.type
                if (type == 'edit' || type =='create' ) {
                var newrec = context.newRecord
                var recid = newrec.id
                var Trandate = newrec.getValue('trandate')
                log.debug({
                    title: 'date',
                    details: Trandate
                })
                
             
        }

    }
    

     
        exports.afterSubmit = afterSubmit;
        //exports.pageInit = pageInit;
        return exports;


        }
    
);
   