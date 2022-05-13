/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */
 define(['N/search', 'N/runtime', 'N/format', 'N/record', 'N/task'],
 function (search, runtime, format, record, task) {

     var exports = {};




     function execute(context) {
         try {

          
             
                             const IB_Search = search.load({
                                 id: 'customsearch_ib_status'
             
                             })
                             var IB = [];
                            // var Cols = search.getColumns()
                             var resultset = IB_Search.run();
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
                                    IB.push({
                                         IB_ID: s[i].id,
                                         //Status_Name: s[i].getValue({ name: 'formulatext'}),
                                         Next_Update_Date: s[i].getValue({ name: 'formuladate'}),
                                         IB_Status: s[i].getValue({ name: 'formulatext'}),
                                        })
                                    }
                                }
                             log.debug({
                                 title: 'Data',
                                 details: IB
                             })
                             var CountJson = IB.length
                             log.debug({
                                 title: 'Total Batch Json Count:',
                                 details: CountJson
                             })
                            UpdateStatusIB(IB, CountJson);
       
         } catch (e) {
             log.error('error', e);
         }
     }


     function UpdateStatusIB(IB, CountJson) {


         if (CountJson == 0) {
             return
         }
         else {
             for (var i = 0; i < CountJson; i++) {
                 
                var rec = record.load({
                    type: 'customrecord_ib',
                    id: IB[i].IB_ID,
                    isDynamic: true,
                    });
                    var Next_Update_Date =  rec.getValue({
                        fieldId: 'custrecord_ib_next_update_status'
                    })
                    rec.setValue({
                        fieldId: 'custrecord_ib_warranty_status',
                        value: IB[i].IB_Status,
                    });
                    if (!isNullOrEmpty(IB[i].Next_Update_Date)){ 
                        Next_Update_Date = FormatDate(IB[i].Next_Update_Date)
                        }
                    rec.setValue({
                        fieldId: 'custrecord_ib_next_update_status',
                        value: Next_Update_Date,
                    })
                    rec.save()
                    

                 
                     if (GetUsage() < 100) {
                         {
                             var taskId = Reschedule();
                             log.debug({
                                 title: "Reschedule",
                                 details: '{Task ID:' + taskId + ', Last FF Update: ' + UpdateFF + ',Last IBrec: ' + IBrecID + ', Rec: ' + JSON.stringify(IB[i]) + '}'

                             })
                             return;
                         }
                     }
                     log.debug({
                         title: 'Usage Remaining Rec N: ' + i ,
                         details: GetUsage()
                     })

                 }





             }
        }


     
     function GetUsage() {
         var scriptObj = runtime.getCurrentScript();
         var remainingUsage = scriptObj.getRemainingUsage();
         return remainingUsage
     }



     function isNullOrEmpty(val) {

         if (typeof (val) == 'undefined' || val == null || (typeof (val) == 'string' && val.length == 0)) {
             return true;
         }
         return false;
     }

     function FormatDate(date) {
         var rawDateString = date;
         var parsedDate = format.parse({
             value: rawDateString,
             type: format.Type.DATE
         });
         return parsedDate
     }

     function Reschedule() {
         var scriptTask = task.create({ taskType: task.TaskType.SCHEDULED_SCRIPT });
         scriptTask.scriptId = runtime.getCurrentScript().id;
         scriptTask.deploymentId = runtime.getCurrentScript().deploymentId;
         scriptTask.submit();
     }



     return {
         execute: execute
     };

 }
);
