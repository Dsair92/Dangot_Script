/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
 define(['N/search','N/file', 'N/runtime', 'N/format','N/record', 'N/task','N/currency'], function(search,file, runtime,format, record, task,currency) {
    var exports = {};

    function execute(context) {
        var header = false
        var Data = []
        var CSV = file.load({id: 2200042});
        var iterator = CSV.lines.iterator();
        var script = runtime.getCurrentScript();
        var last_row = script.getParameter({ name: "custscript_csv_last_row" });
        log.debug({
            title: 'lastrow',
            details: last_row
        })
        if (isNullOrEmpty(last_row)){
            last_row = 0
        }

        var Other_Name = record.create({
            type: 'othername',
            isDynamic: true,
            })
     
        iterator.each(function (line){
            var linevalue = line.value.split(',')
            if (!header){
                header = true
            }
            else{
                //Data.push(linevalue)
               
                Data.push(linevalue)
                             
            }
            return true
        })
      

        
        
        for (var i = last_row; i < Data.length;i++){
            try{
            var Other_Name = record.create({
                type: 'othername',
                isDynamic: true,
                })
                log.debug({
                    title: 'Data :'+ i,
                    details: Data[i]
                })

                Other_Name.setValue('companyname',Data[i][1]);
                Other_Name.setValue('email',Data[i][6]);
                Other_Name.setValue('subsidiary','12');
                Other_Name.setValue('custentity_related_customer',Data[i][7]);
                Other_Name.setValue('externalid',Data[i][0]);
                Other_Name.setValue('category','1');
            var Rec =    Other_Name.save();
            log.debug({
                title: 'Rec Save: ' + i,
                details: Rec
            })
            var S_Other_Name = record.load({type:'othername',id:Rec,isDynamic:false})
                S_Other_Name.insertLine({
                    sublistId: 'addressbook',
                    line: 0,
                    });
                    var Address = S_Other_Name.getSublistSubrecord({"sublistId": "addressbook", "fieldId": "addressbookaddress", "line": 0})
                 
                    Address.setValue('country','IL');
                    Address.setValue('city',Data[i][4]);   
                    Address.setValue('addr1',Data[i][3]);
  
                S_Other_Name.save();
                if (GetUsage()< 100){
                    Reschedule(i)
                }

                


                

             
                }catch(e){log.debug({
                                title: 'Error: '+ i,
                                details: e
                                })
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
    
    function Reschedule(lastrow) {
        var Task_ID = runtime.getCurrentScript().id;
        var Task_Deployment = runtime.getCurrentScript().deploymentId;

        var scriptTask = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT,scriptId : Task_ID,deploymentId: Task_Deployment,params: {'custscript_csv_last_row': lastrow}})
        //scriptTask.scriptId = runtime.getCurrentScript().id;
        //scriptTask.deploymentId = runtime.getCurrentScript().deploymentId;
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
   