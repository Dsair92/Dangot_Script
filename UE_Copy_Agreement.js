/**
 * @NAPIVersion 2.0
 * @NscriptType UserEventScript
 * @NmoduleScope SameAccount
 * 
 */

 define(['N/record', 'N/error', 'N/search', 'N/format','N/task', 'N/log'],
 function (record, error, search, format, task,log) {
        

     function afersubmit(context) {
        var NewRec = context.newRecord.id
        var Agr = record.load({
            type: 'customrecord_agr',
            id: NewRec,
            isDynamic: true,
           
        })
        
        var oldagr = Agr.getValue('custrecord_agr_created_from_agr');

        log.debug({
            title: 'OLD Agr',
            details: oldagr
        })
             
       if (oldagr.length > 0){
        var OldRec = record.load({
            type: 'customrecord_agr',
            id: oldagr,
            isDynamic: false,
            })

            OldRec.setValue('custrecord_agr_next_agreement',context.newRecord.id);
            OldRec.save()

            var Data= GetIB(oldagr,NewRec)
            log.debug({
                title: 'Data',
                details: Data
            })
            
            var params = {
                custscript_renewal_action: 2,
                custscript_renewal_data: JSON.stringify(Data),
                custscript_renewal_remove_data: [],
                custscript_renewal_status: 2,
            };

            var scriptTask = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT});
            scriptTask.scriptId = 'customscript_renewal_agr_ss';
            scriptTask.deploymentId = null;
            scriptTask.params = params;
            var scriptTaskId = scriptTask.submit();
            log.debug({
                title: 'SS:',
                details: scriptTaskId
            })
            
            /*
             var params = {
            custscript_renewal_action: action,
            custscript_renewal_data: JSON.stringify(dataToUpdate),
            custscript_renewal_remove_data: JSON.stringify(dataToRemove),
            custscript_renewal_status: status,
        };
        nlapiScheduleScript('customscript_renewal_agr_ss', null, params);
        */

       }
    
     
        return         
    };

        
    function GetIB (Agr,TargetAgr) {
        const IBcustomer = search.createColumn({ name: 'custrecord_ib_customer' });
        const Agrrate = search.createColumn({ name: 'custrecord_ib_agr' });
        const Rate = search.createColumn({ name: 'custrecord_ib_rate' });
        const IBSearch = search.create({
            type: 'customrecord_ib',
            filters: [
                ['custrecord_ib_agr', 'anyof', Agr]
                ],
            columns: [
                Agrrate,
                Rate,
                IBcustomer,                
              ],
            });
            var agrLineList = [];
                    var resultset = IBSearch.run();
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
                                        agrLineList.push({
                                            ib_id: s[i].id,
                                            agr_target: TargetAgr ,
                                            cust_target: s[i].getValue('custrecord_ib_customer'),
                                            renewal_amount: s[i].getValue('custrecord_ib_rate'),
                                            // exclude_month_warr: s[i].getValue('custrecord_ib_excluded_warranty_month'),
                                            //disabled: s[i].getValue('formulatext'),               
                                            });
                                }
                            }
            
            return agrLineList
    }
     
     return {
         //beforeLoad: beforeload,
         //beforeSubmit: beforesubmit,
         afterSubmit: afersubmit
     };

}
);
   