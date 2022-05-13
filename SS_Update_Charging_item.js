/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
 define(['N/search', 'N/runtime', 'N/format','N/record', 'N/task'], function(search, runtime,format, record, task) {
    var exports = {};

    function execute(context) {


        log.debug({
            title: 'context',
            details: context
        })

        
        const Agr_line = search.load({
            id: 'customsearch_assign_charging_item'
            
        })
        var IB = [];
                    var resultset = Agr_line.run();
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
                                log.debug({
                                    title: 'Data Update :',
                                    details: s.length
                                })
                                for (var i = 0; i < s.length; i++) {
                                    var ID = s[i].getValue({ name: 'internalid'});
                                    var BussinessLine = s[i].getValue({ name: 'custrecord_agr_line_bus_line' });
                                                                       
                                    try{
                                    var IB = record.load({
                                    
                                        type: 'customrecord_agr_line',
                                        id: ID,
                                        isDynamic: true,
                                    });
                                    switch(BussinessLine){
                                        case '208' : IB.setValue('custrecord_agr_line_charging_item','7534');//אקדמי	
                                        break;
                                        case '209' : IB.setValue('custrecord_agr_line_charging_item','7535');//בקרת כניסה	
                                        break;
                                        case '210' : IB.setValue('custrecord_agr_line_charging_item','7536');//חטיבת בטחון	
                                        break;
                                        case '211' : IB.setValue('custrecord_agr_line_charging_item','7537');//מסלקה פנסיונית	
                                        break;
                                        case '212' : IB.setValue('custrecord_agr_line_charging_item','7538');//נוכחות
                                        break;
                                        case '213' : IB.setValue('custrecord_agr_line_charging_item','7539');//שכר
                                        break;
                                    }
                                    IB.save()
                                    }catch(e){
                                        log.debug({
                                            title: 'Error Update: ' + ID ,
                                            details: e
                                        })
                                    } 
                                    
                                    if (GetUsage() < 100) {
                                        
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
   