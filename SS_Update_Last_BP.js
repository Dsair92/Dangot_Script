/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
 define(['N/search', 'N/runtime', 'N/format','N/record', 'N/task'], function(search, runtime,format, record, task) {
    var exports = {};

    function execute(context) {
        //var FF_Trigger = context.getSetting('SCRIPT', 'custscript_ff_id')
        /*log.debug({
            title: 'Triggerd by FF ID ',
            details: params
        })
*/

        log.debug({
            title: 'context',
            details: context
        })

        
        const FF_Search = search.load({
            id: 'customsearch_last_bp'
            
        })
        var IB = [];
                    var resultset = FF_Search.run();
                    var s = [];
                    var searchid = 0;
                    do {
                            var resultslice = resultset.getRange(searchid, searchid + 1000);
                            for (var rs in resultslice) {
                                s.push(resultslice[rs]);
                                searchid++;
                            }
                            
                            
                        } while (resultslice != null && resultslice.length >= 1000);
                       
                    if (s != null) {
                                for (var i = 0; i < s.length; i++) {
                                    var ID = s[i].getValue({ name: 'internalid', summary: search.Summary.GROUP });
                                    var Last_BP_Field = s[i].getValue({ name: 'custrecord_ib_last_billing_plan', summary: search.Summary.GROUP });
                                    var Last_BP_Search =s[i].getValue({ name: 'custrecord_bill_plan_per_end_date', join: 'CUSTRECORD_BP_IB', summary: search.Summary.MAX });
                                    try{
                                    var IB = record.load({
                                    
                                        type: 'customrecord_ib',
                                        id: ID,
                                        isDynamic: true,
                                    });
                                    if (isNullOrEmpty(Last_BP_Search)){
                                        IB.setValue('custrecord_ib_last_billing_plan',null)
                                    }
                                    else {
                                        
                                        IB.setValue('custrecord_ib_last_billing_plan',FormatDate(Last_BP_Search))
                                    }
                                    IB.save()
                                    }catch(e){
                                        log.debug({
                                            title: 'Error Update: ' + ID ,
                                            details: e
                                        })
                                    }   
                                }
                            }

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
    
    exports.execute = execute;
    return exports;


}
);
   