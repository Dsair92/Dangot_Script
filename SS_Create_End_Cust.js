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
        id as rec_id, 
        custrecord_euc_external_id as ex_id,
        custrecord_euc_end_user_name as name,
        custrecord_euc_cust as customer_id,
        custrecord_euc_address_1 as address_1,
        custrecord_euc_address_2 as address_2,
        custrecord_euc_address_3 as address_3,
        custrecord_euc_city as city,
        custrecord__euc_country as country
        from customrecord_end_cust_creation`
        }).asMappedResults()
        for (var i = 0; i < end_user_ql.length; i++) {
            try{
                log.debug({title: 'Data :' + i ,details: JSON.stringify(end_user_ql[i])});
                var othername = query.runSuiteQL({query:
                    `select
                    externalid,
                    id
                    from othername
                    where externalid =${end_user_ql[i].ex_id} `}).asMappedResults();
                log.debug({
                    title: 'search',
                    details: othername
                })
                if (othername.length == 0){
                    var End_User = record.create({
                        type: 'othername',
                        isDynamic: true,
                    });    
                }else{
                    var End_User = record.load({type:'othername',id:othername[0].id,isDynamic:false})
                }  
                End_User.setValue('companyname',end_user_ql[i].name);
                //End_User.setValue('email',Data[i][6]);
                End_User.setValue('subsidiary','14'); // Dangot
                End_User.setValue('custentity_related_customer',end_user_ql[i].customer_id);
                End_User.setValue('externalid',end_user_ql[i].ex_id);
                End_User.setValue('category','1');
                var Rec = End_User.save();
                log.debug({
                    title: 'Rec Save: ' + i,
                    details: Rec
                })
                if (!isNullOrEmpty(end_user_ql[i].country)){
                    var S_Other_Name = record.load({type:'othername',id:Rec,isDynamic:false})
                    S_Other_Name.insertLine({sublistId: 'addressbook',line: 0,});
                    var Address = S_Other_Name.getSublistSubrecord({"sublistId": "addressbook", "fieldId": "addressbookaddress", "line": 0}) 
                    Address.setValue('country',end_user_ql[i].country);
                    Address.setValue('city',end_user_ql[i].city);
                    Address.setValue('addr1',end_user_ql[i].address_1);
                    Address.setValue('addr1',end_user_ql[i].address_1);
                    Address.setValue('addr1',end_user_ql[i].address_1);   
                    S_Other_Name.save();
                }
                record.delete({type:'customrecord_end_cust_creation',id:end_user_ql[i].rec_id,isDynamic: true});
            }catch(e){
                log.error({
                    title: 'Creation Error',
                    details: e
                })
            }
            if (GetUsage() < 100) {
                var taskId = Reschedule();
                log.debug({title: 'Reschedule',details: 'Task ID : '+taskId});
                return;
            }  
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
   