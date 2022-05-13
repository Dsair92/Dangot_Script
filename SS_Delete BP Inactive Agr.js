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

        
        const Search = search.load({
            id: 'customsearch_bp_uninvoiced_agr_inactive'
            
        })
        
            var resultset = Search.run();
            var s = [];
            var searchid = 0;
            do {
                    var resultslice = resultset.getRange(searchid, searchid + 1000);
                    for (var rs in resultslice) {
                        s.push(resultslice[rs]);
                        searchid++;
                    }
                    
                    
                } while (resultslice != null && resultslice.length >= 1000);
            var Count_Delete = 0
            if (s != null) {
                        log.debug({
                            title: 'Data Update :',
                            details: s.length
                        })
                        for (var i = 0; i < s.length; i++) {
                            var ID = s[i].getValue({ name: 'internalid' });
                            try{
                            var BP = record.delete({
                            
                                type: 'customrecord_billing_plan',
                                id: ID,
                                isDynamic: true,
                            });

                            Count_Delete = Count_Delete + 1

                                }catch(e){
                                    log.debug({
                                        title: 'Error Update: ' + ID ,
                                        details: e
                                    })
                                } 
                                if (GetUsage() < 100) {
                                    log.audit({
                                        title: 'Rec Delete',
                                        details: Count_Delete
                                    })
                                    var taskId = Reschedule();
                                    log.debug({
                                        title: 'Reschedule',
                                        details: 'Task ID : '+taskId
                                    })
                                    return;
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
    
    function Reschedule() {
        var scriptTask = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT});
        scriptTask.scriptId = runtime.getCurrentScript().id;
        scriptTask.deploymentId = runtime.getCurrentScript().deploymentId;
        scriptTask.submit();
    }

    

    function GetUsage(){
        var scriptObj = runtime.getCurrentScript();
        var remainingUsage = scriptObj.getRemainingUsage();
        return remainingUsage
    }
              
    exports.execute = execute;
    return exports;


}
);
   