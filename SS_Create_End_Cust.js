/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
 define(['N/search', 'N/runtime', 'N/format','N/record', 'N/query','N/task'], function(search, runtime,format, record,query, task) {
    var exports = {};

    function execute(context) {
        var end_user_ql = query.runSuiteQL({ query: 
        `select 
        custrecord_euc_external_id as ex_di,
        custrecord_euc_end_user_name as name,
        custrecord_euc_cust as customer_id,
        custrecord_euc_address_1 as address_1,
        custrecord_euc_address_2 as address_2,
        custrecord_euc_address_3 as address_3,
        custrecord_euc_city as city,
        custrecord_euc_cust as country
        from customrecord_end_cust_creation`
        }).asMappedResults()
        for (var i = 0; i < end_user_ql.length; i++) {
            log.debug({title: 'Data :' + i ,details: JSON.stringify(end_user_ql[i])});
            /*
            try{
                var BP = record.delete({type: 'customrecord_billing_plan',id: ID,isDynamic: true,});
                Count_Delete = Count_Delete + 1
            }catch(e){
                log.debug({title: 'Error Update: ' + ID ,details: e});
            } 
            if (GetUsage() < 100) {
                log.audit({title: 'Rec Delete',details: Count_Delete});
                var taskId = Reschedule();
                log.debug({title: 'Reschedule',details: 'Task ID : '+taskId});
                return;
            }  
            */
        }
    }

  
  
    function isNullOrEmpty(val) {

    if (typeof (val) == 'undefined' || val == null || (typeof (val) == 'string' && val.length == 0)) {
        return true;
    }
    return false;
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
   