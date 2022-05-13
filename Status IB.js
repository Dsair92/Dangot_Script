/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */
 define(['N/search', 'N/runtime', 'N/format', 'N/record', 'N/task'],
 function (search, runtime, format, record, task) {

     var exports = {};




     function execute(context) {
         try {

          
             
                             const FF_Search = search.load({
                                 id: 'customsearch_ib_status'
             
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
                                    IB.push({
                                         IB_ID: s[i].id,
                                         Status_Name: s[i].getValue({ name: 'formulatext', formula: 'case when {custrecord_inactivation_date} < {today}  then \'לא פעיל\'  when {custrecord_ib_agreement_type} = \'חיוב מתחדש\'  then \'בחוזה חיוב מתחדש\' when {today} between {custrecord_ib_site_war_start_date} and {custrecord_ib_site_war_end_date} then \'באחריות באתר הלקוח\' when {today} between {custrecord_ib_lab_war_start_date} and {custrecord_ib_lab_war_end_date}  then \'באחריות מעבדה\' when {today} between {custrecord_ib_agr_start_date} and {custrecord_ib_agr_end_date}  then \'בחוזה שירות\'  else \'לא באחריות\' end' }),
                                         Next_Update_Date: s[i].getValue({ name: 'formuladate', formula: 'case when {custrecord_inactivation_date} < {today}  then {custrecord_inactivation_date}  when {custrecord_ib_agreement_type} = \'חיוב מתחדש\'  then {custrecord_ib_agr.custrecord_agr_end_date} when {today} between {custrecord_ib_site_war_start_date} and {custrecord_ib_site_war_end_date} then {custrecord_ib_site_war_end_date} when {today} between {custrecord_ib_lab_war_start_date} and {custrecord_ib_lab_war_end_date}  then {custrecord_ib_site_war_end_date} when {today} between {custrecord_ib_agr_start_date} and {custrecord_ib_agr_end_date}  then {custrecord_ib_agr_end_date}   else null  end' }),
                                         IB_Status: s[i].getValue({ name: 'formulatext', formula: 'case when {custrecord_inactivation_date} < {today}  then 1  when {custrecord_ib_agreement_type} = \'חיוב מתחדש\'  then 2 when {today} between {custrecord_ib_site_war_start_date} and {custrecord_ib_site_war_end_date} then 3 when {today} between {custrecord_ib_lab_war_start_date} and {custrecord_ib_lab_war_end_date}  then 4 when {today} between {custrecord_ib_agr_start_date} and {custrecord_ib_agr_end_date}  then 6   else 5  end' }),
                                        });
             
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
                            // CreateJSONPerIB(IB, CountJson);
       
         } catch (e) {
             log.error('error', e);
         }
     }

     function GetDetail(Detail) {
         const inventorydetailSearchColNumber = search.createColumn({ name: 'inventorynumber', sort: search.Sort.ASC });
         const inventorydetailSearchColInternalId = search.createColumn({ name: 'internalid', join: 'inventoryNumber' });
         const inventorydetailSearchColQuantity = search.createColumn({ name: 'quantity' });
         const inventorydetailSearch = search.create({
             type: 'inventorydetail',
             filters: [['internalid', 'anyof', Detail]],
             columns: [
                 inventorydetailSearchColNumber,
                 inventorydetailSearchColInternalId,
                 inventorydetailSearchColQuantity,
             ]
         });
         var DataDetail = [];
         var resultset = inventorydetailSearch.run();
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
                 DataDetail.push({
                     ID: s[i].id,
                     Serial_ID: s[i].getValue({ name: 'internalid', join: 'inventoryNumber' }),
                     Serial_S_Num: s[i].getValue({ name: 'inventorynumber' })
                 });
             }
         }
         return DataDetail
     }

     function CreateJSONPerIB(IB, CountJson) {


         if (CountJson == 0) {
             return
         }
         else {
             for (var i = 0; i < CountJson; i++) {
                 var LineFFQty = IB[i].FF_Quantity;
                 var LineCreatedIB = ''
                 if (isNullOrEmpty(IB[i].IbCreated)) { LineCreatedIB = 0 }
                 else { LineCreatedIB = Number(IB[i].IbCreated) }
                 var IsSerial = IB[i].Item_serial;
                 var AgrType = IB[i].AgrType;
                 var Line = IB[i];
                 var TrueID_FF = ''
                 if (IB[i].Ff_Line_Id == 0) {
                     TrueID_FF = 0
                 }
                 else {
                     TrueID_FF = IB[i].Ff_Line_Id - ((IB[i].Ff_Line_Id / 3) * 2)
                 }
                 log.debug({
                     title: 'FF Line Index Batch: ' + i,
                     details: Line
                 })





                 for (var j = 0 + LineCreatedIB; j < LineFFQty; j++) {
                     try {
                         var FF = record.load({
                             type: 'itemfulfillment',
                             id: IB[i].Id_FF,
                             isDynamic: true,
                         });
                         var LineFF = FF.selectLine({
                             sublistId: 'item',
                             line: TrueID_FF,
                         });

                         var ItemLineFF = LineFF.getCurrentSublistValue({
                             sublistId: 'item',
                             fieldId: 'item'
                         });
                         var QtyFF = LineFF.getCurrentSublistValue({
                             sublistId: 'item',
                             fieldId: 'custcol_ib_created'
                         });



                         if (IB[i].Item == ItemLineFF && QtyFF < IB[i].FF_Quantity) {
                             var IBRecord = record.create({
                                 type: 'customrecord_ib',
                                 isDynamic: false,
                             });
                             IBRecord.setValue('custrecord_ib_customer', IB[i].Customer);
                             IBRecord.setValue('altname', IB[i].Customer);
                             IBRecord.setValue('custrecord_ib_item', IB[i].Item)
                             if (IsSerial == true) {
                                 IBRecord.setValue('custrecord_ib_serial_number', IB[i].InventoryDetailJson[j].Serial_ID)
                             }
                             IBRecord.setValue('custrecord_ib_customer', IB[i].Customer);
                             IBRecord.setValue('altname', 'To be Named');
                             IBRecord.setValue('custrecord_ib_item', IB[i].Item)
                             IBRecord.setValue('custrecord_ib_customer', IB[i].Customer);
                             IBRecord.setValue('custrecord_ib_ff', IB[i].Id_FF);
                             IBRecord.setValue('custrecord_ib_ff_line', IB[i].Ff_Line_Id);
                             IBRecord.setValue('custrecord_ib_so', IB[i].So_Id);
                             IBRecord.setValue('custrecord_ib_so_line', IB[i].SO_Line_ID);
                             IBRecord.setValue('custrecord_ib_rate', IB[i].ItemRate);
                             IBRecord.setValue('custrecord_ib_installment_date', FormatDate(IB[i].FfDate));
                             IBRecord.setValue('custrecord_ib_currency', IB[i].Currency);
                             if (AgrType == 1) {
                                 IBRecord.setValue('customform', 122)//Warranty
                                 IBRecord.setValue('custrecord_ib_site_war_start_date', FormatDate(IB[i].FfDate));
                                 IBRecord.setValue('custrecord_ib_site_war_month', FormatDate(IB[i].Site_Warranty_Months));
                                 IBRecord.setValue('custrecord_ib_lab_war_month', FormatDate(IB[i].Lab_Warranty_Months));
                             }
                             if (AgrType == 2) {
                                 IBRecord.setValue('customform', 135)//Recurring
                                 IBRecord.setValue('custrecord_ib_billing_cycle', IB[i].BillingCycle);

                             }
                             var IBrecID = IBRecord.save()

                             log.debug({
                                 title: 'IB Created',
                                 details: "{IBrec: " + IBrecID + ",Rec: " + JSON.stringify(IB[i]) + '}'
                             })
                             LineFF.setCurrentSublistValue({
                                 sublistId: 'item',
                                 fieldId: 'custcol_ib_created',
                                 line: TrueID_FF,
                                 value: (QtyFF + 1),
                             });


                             LineFF.commitLine({
                                 sublistId: 'item'
                             });
                             var UpdateFF = FF.save();
                             log.debug({
                                 title: 'FF Update',
                                 details: '{FF Update:' + UpdateFF + ',IBrec: ' + IBrecID + ",Rec: " + JSON.stringify(IB[i]) + '}'
                             })
                         }
                         else {
                             log.error({
                                 title: 'Missmatch IB Data Error',
                                 details: IB[i]
                             })
                         }
                     } catch (e) {
                         log.error({
                             title: 'Creation Error',
                             details: '{JSON: ' + JSON.stringify(IB[i]) + ',Error:' + e + '}'
                         })
                     }
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
                         title: 'Usage Remaining Rec N: ' + i + 'Qty: ' + (j + 1),
                         details: GetUsage()
                     })

                 }





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
