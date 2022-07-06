/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */
 define(['N/search', 'N/runtime', 'N/format', 'N/record', 'N/task'],
 function (search, runtime, format, record, task) {

    function execute(context) {
        try {
            var script = runtime.getCurrentScript();
            Triggerd_FF = script.getParameter({ name: "custscript_ff_id" });
            log.debug('Triggerd_FF', Triggerd_FF)              
            const FF_Search = search.load({
                id: 'customsearch_bs_ff_ib'               
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
                    var DetailID = s[i].getValue({ name: 'internalid', join: 'inventoryDetail' });
                    var IsSerial = s[i].getValue({ name: 'isserialitem', join: 'item' });
                    var inventoryID = s[i].getValue({ name: 'serialnumbers' });
                    var Service_Start_Date = s[i].getValue({name: 'custcol_service_start_date', join: 'appliedToTransaction' });
                    var Service_End_Date = s[i].getValue({name: 'custcol_service_end_date', join: 'appliedToTransaction' });
                    var FF_Date = s[i].getValue({name: 'trandate' });
                    var Customer = s[i].getValue({ name: 'entity' });
                    var IB_Customer = s[i].getValue({name: 'custbody_ib_customer', join: 'appliedToTransaction' });
                    if (!isNullOrEmpty(IB_Customer)){Customer = IB_Customer}            
                    if (isNullOrEmpty(Service_Start_Date)) { Service_Start_Date = FF_Date}
                    Inventory_array = inventoryID.split("\n")
                    var DetailJson = ''
                    if (IsSerial == true) {  DetailJson = GetDetail(DetailID) }
                    IB.push({
                        Id_FF: s[i].id,
                        Ff_Line_Id: s[i].getValue({ name: 'line' }),
                        So_Id: s[i].getValue({ name: 'internalid', join: 'appliedToTransaction' }),
                        SO_Line_ID: s[i].getValue({ name: 'line', join: 'appliedToTransaction' }),
                        Wisepay: s[i].getValue({ name: 'custcol_wisepay', join: 'appliedToTransaction' }),
                        Item: s[i].getValue({ name: 'item' }),
                        Description: s[i].getValue({ name: 'displayname',join: 'item' }),
                        Item_type: s[i].getValue({ name: 'type', join: 'item' }),
                        Item_serial: IsSerial,
                        Serial_N: Inventory_array,
                        InventoryDetailID: DetailID,
                        InventoryDetailJson: DetailJson,
                        FF_Quantity: s[i].getValue({ name: 'quantity' }),
                        IbCreated: s[i].getValue({ name: 'custcol_ib_created' }),
                        ItemRate: s[i].getValue({ name: 'custcol_reccuring_rate', join: 'appliedToTransaction' }),
                        FfDate: FF_Date,
                        SLA: s[i].getValue({ name: 'custcol_dangot_sla_hours', join: 'appliedToTransaction' }),
                        AgrType: s[i].getValue({ name: 'custcol_bs_agr_type', join: 'appliedToTransaction' }),
                        Lab_Warranty_Months: s[i].getValue({ name: 'custcol_lab_warranty', join: 'appliedToTransaction' }),
                        Site_Warranty_Months: s[i].getValue({ name: 'custcol_site_warranty', join: 'appliedToTransaction' }),
                        BillingCycle: s[i].getValue({ name: 'custcol_bs_billing_cycle', join: 'appliedToTransaction' }),
                        BillingCycle_2: s[i].getValue({ name: 'custcol_billing_cycle_2', join: 'appliedToTransaction' }),
                        Charge_Type: s[i].getValue({ name: 'custcol_dangot_recurring_charge_type', join: 'appliedToTransaction' }),
                        Charge_Type_2: s[i].getValue({ name: 'custcol_charge_type_2', join: 'appliedToTransaction' }),
                        Month_First_Period: s[i].getValue({ name: 'custcol_month_first_period', join: 'appliedToTransaction' }),
                        Currency: '5', // Always ILS  s[i].getValue({ name: 'currency', join: 'appliedToTransaction' }), Always ILS // 5
                        Customer: Customer,
                        Partner: s[i].getValue({ name: 'partner', join: 'appliedToTransaction' }),
                        Agr_Sub_Type: s[i].getValue({ name: 'custcol_agr_sub_type', join: 'appliedToTransaction' }),
                        EndCustomer: s[i].getValue({ name: 'custcol_end_customer', join: 'appliedToTransaction' }),
                        Renewal_Rate: s[i].getValue({ name: 'custcol_recurring_second_year', join: 'appliedToTransaction' }),
                        Service_Start_Date: Service_Start_Date,//NEED EDIT
                        Service_End_Date: Service_End_Date,
                    }); 
                }
            }
            var CountJson = IB.length           
            CreateJSONPerIB(IB, CountJson);   
        } catch (e) {
            log.error('error', e);
        }
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
// ******Start Agreement Reccuring ****** //
                if (AgrType == 2){
                    Cust_Load = record.load({
                        type : 'customer',
                        id : IB[i].Customer,
                    })
                    var Agr = ''
                    var Agr_field = ''
                    switch (IB[i].Agr_Sub_Type){
                        case '1' :
                        Agr_field = 'custentity_agr_pos'//POS
                        break
                        case '2' :
                        Agr_field = 'custentity_agr_credit_terminal'//Credit Terminal
                        break
                        case '3' :
                        Agr_field = 'custentity_agr_printer'//Printer
                        break
                        case '4' :
                        Agr_field = 'custentity_agr_barcode'//Barcode
                        break 
                        case '6' :
                        Agr_field = 'custentity_agr_esl'//ESL
                        break 
                    }                 
                    Agr = Cust_Load.getValue(Agr_field);
                    if (isNullOrEmpty(Agr)){
                        var Create_Agr = record.create({
                            type : 'customrecord_agr',
                            isDynamic : false
                        })
                        Create_Agr.setValue('customform',130); // Recurring Agr // SB1 > 134
                        Create_Agr.setValue('custrecord_agr_type',2); // Recurring Agr
                        Create_Agr.setValue('custrecord_agr_customer',IB[i].Customer);
                        Create_Agr.setValue('custrecord_agr_status',1);//Active
                        Create_Agr.setValue('custrecord_agr_srt_date',FormatDate(IB[i].FfDate));
                        Create_Agr.setValue('custrecord_agr_approval_status',3);//Approved
                        Create_Agr.setValue('custrecord_agr_sub_type',IB[i].Agr_Sub_Type);
                        Create_Agr.setValue('custrecord_agr_billing_on',1);//Billing On Start Date
                        Agr = Create_Agr.save()
                        Cust_Load.setValue(Agr_field,Agr);
                        Cust_Load.save({ignoreMandatoryFields: true})
                    }
                }
// ****** END Agreement Reccuring  ******   //           
                var Line = IB[i];
                var TrueID_FF = ''
                var Detail_Empty = ''
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
                    // ****** Start IB Creation  ******   //   
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
                        if (IsSerial== true) {
                            var Inventory_N = record.load({
                                type : 'inventorynumber',
                                id : IB[i].InventoryDetailJson[j].Serial_ID,
                                isDynamic : false
                            })
                            var IB_Detail = Inventory_N.getValue('custitemnumber_ib_related')
                            Detail_Empty = isNullOrEmpty(IB_Detail)
                            if (Detail_Empty == false){      
                                var IB_Update = record.load({
                                    type: 'customrecord_ib',
                                    id: IB_Detail,
                                    isDynamic: false,         
                                })
                                try{cust_IB = IB_Update.getValue('custrecord_ib_customer')
                                if (isNullOrEmpty(cust_IB)){
                                    IB_Update.setValue('custrecord_ib_customer', IB[i].Customer);
                                    IB_Update.setValue('custrecord_ib_ff', IB[i].Id_FF);
                                    IB_Update.setValue('custrecord_ib_ff_line', IB[i].Ff_Line_Id);
                                    IB_Update.setValue('custrecord_ib_so', IB[i].So_Id);
                                    IB_Update.setValue('custrecord_ib_so_line', IB[i].SO_Line_ID);
                                    IB_Update.setValue('custrecord_ib_rate', IB[i].ItemRate);
                                    IB_Update.setValue('custrecord_ib_installment_date', FormatDate(IB[i].FfDate));
                                    IB_Update.setValue('custrecord_ib_sla_hours', IB[i].SLA);
                                    IB_Update.setValue('custrecord_ib_currency', IB[i].Currency);
                                    if (AgrType == 1) {
                                       //  IB_Update.setValue('customform', 133)//Warranty >> SB1 = 122
                                         IB_Update.setValue('custrecord_ib_site_war_start_date', FormatDate(IB[i].FfDate));
                                         IB_Update.setValue('custrecord_ib_site_war_month', IB[i].Site_Warranty_Months);
                                         IB_Update.setValue('custrecord_ib_lab_war_month', IB[i].Lab_Warranty_Months);
                                    }
                                    if (AgrType == 2) {
                                    //   IB_Update.setValue('customform', 132)//Recurring >> SB1 = 135
                                        IB_Update.setValue('custrecord_ib_billing_cycle', IB[i].BillingCycle);
                                        IB_Update.setValue('custrecord_ib_agr',Agr);
                                        IB_Update.setValue('custrecord_ib_renewal_amount',IB[i].Renewal_Rate);
                                    }
                                    var IBUpdaterecID = IB_Update.save()
                                    log.debug({
                                         title: 'IBUpdaterecID',
                                         details: IBUpdaterecID
                                    })
                                }
                                }catch(e){
                                     log.debug({
                                         title: 'IBUpdaterecID',
                                         details: e
                                     })
                                 }
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
                             return
                             }
                             }
                         else {
                             Detail_Empty = true
                         }
                         if (IB[i].Item == ItemLineFF && QtyFF < IB[i].FF_Quantity && Detail_Empty == true) {
                             var FF_Date_Value = FormatDate(IB[i].FfDate);
                             var Billing_Date = FormatDate(IB[i].Service_Start_Date);
                             var IBRecord = record.create({
                                 type: 'customrecord_ib',
                                 isDynamic: false,
                             });
                             IBRecord.setValue('custrecord_ib_customer', IB[i].Customer);
                             IBRecord.setValue('custrecord_ib_item', IB[i].Item);
                             if (IsSerial == true) {
                                 IBRecord.setValue('custrecord_ib_serial_number', IB[i].InventoryDetailJson[j].Serial_ID)
                             }
                             IBRecord.setValue('name','To be Named');
                             IBRecord.setValue('custrecord_ib_item', IB[i].Item);
                             IBRecord.setValue('custrecord_ib_ff', IB[i].Id_FF);
                             IBRecord.setValue('custrecord_ib_ff_line', IB[i].Ff_Line_Id);
                             IBRecord.setValue('custrecord_ib_so', IB[i].So_Id);
                             IBRecord.setValue('custrecord_ib_so_line', IB[i].SO_Line_ID);
                             IBRecord.setValue('custrecord_ib_rate', IB[i].ItemRate);
                             IBRecord.setValue('custrecord_ib_installment_date', FF_Date_Value);
                             IBRecord.setValue('custrecord_ib_currency', IB[i].Currency);
                             IBRecord.setValue('custrecord_ib_partner', IB[i].Partner);
                             IBRecord.setValue('custrecord_ib_end_customer', IB[i].EndCustomer);
                             IBRecord.setValue('custrecord_ib_sla_hours', IB[i].SLA);
                             if (AgrType == 1) {
                          //       IBRecord.setValue('customform', 133)//Warranty >> SB1 122
                                 IBRecord.setValue('custrecord_ib_site_war_start_date', Billing_Date);
                                 if (!isNullOrEmpty(IB[i].Site_Warranty_Months)){IBRecord.setValue('custrecord_ib_site_war_month', Number(IB[i].Site_Warranty_Months))}
                                 if (!isNullOrEmpty(IB[i].Lab_Warranty_Months)){IBRecord.setValue('custrecord_ib_lab_war_month', Number(IB[i].Lab_Warranty_Months))}
                             }
                             if (AgrType == 2) {
                              //   IBRecord.setValue('customform', 132);//Recurring >> SB1 135
                                 IBRecord.setValue('custrecord_ib_billing_cycle', IB[i].BillingCycle);
                                 IBRecord.setValue('custrecord_ib_agr',Agr);
                                 if (IB[i].Agr_Sub_Type == '2'){ Billing_Date = addDays(Billing_Date,5)}                         
                                 IBRecord.setValue('custrecord_ib_initial_billing_date', Billing_Date);
                                 IBRecord.setValue('custrecord_ib_charge_type', IB[i].Charge_Type);
                                 if (!isNullOrEmpty(IB[i].Service_End_Date)){IBRecord.setValue('custrecord_inactivation_date', FormatDate(IB[i].Service_End_Date))};
                                 if (!isNullOrEmpty(IB[i].Month_First_Period)){
                                    var End_Date = ''
                                    if  (IB[i].Agr_Sub_Type == '2'){
                                        End_Date = addDays(addMonths(IB[i].Service_Start_Date,IB[i].Month_First_Period),4)
                                        log.debug({
                                            title: 'Wisepay',
                                            details: IB[i].Wisepay
                                        })
                                        IBRecord.setValue('custrecord_ib_wiseway',IB[i].Wisepay);
                                        IBRecord.setValue('custrecord_ib_cancelation_reason','1');//Cancelation Reason Reccurnig Process
                                    }else { 
                                        End_Date = addDays(addMonths(IB[i].Service_Start_Date,IB[i].Month_First_Period),-1)
                                    }
                                    IBRecord.setValue('custrecord_inactivation_date',End_Date);
                                    //IBRecord.setValue('custrecord_ib_renewal_billing_cycle', FormatDate(IB[i].BillingCycle_2));
                                    //IBRecord.setValue('custrecord_ib_change_terms_recurring',true);
                                    //IBRecord.setValue('custrecord_ib_charge_type_renewal', FormatDate(IB[i].Charge_Type_2));
                                    IBRecord.setValue('custrecord_ib_renewal_amount',IB[i].Renewal_Rate);
                                 }
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
                             if (IsSerial== true) {
                                 Inventory_N.setValue('custitemnumber_ib_related',IBrecID);
                                 Inventory_N.save()
                             }
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
                            details: '{JSON: ' + JSON.stringify(IB[i]) + ",Error:"+ e + '}'
                        })
                            // ****** END IB Creation  ******   //  
                    }
                    if (GetUsage() < 100) {
                        var taskId = Reschedule();
                        log.debug({
                            title: "Reschedule",
                            details: '{Task ID:' + taskId + ', Last FF Update: ' + UpdateFF + ',Last IBrec: ' + IBrecID + ', Rec: ' + JSON.stringify(IB[i]) + '}'
                        })
                        return;
                        }
                    }
                }
                     log.debug({
                         title: 'Usage Remaining Rec N: ' + i + 'Qty: ' + (j + 1),
                         details: GetUsage()
                     })

                 }





             }
         


    
     function GetDetail(Detail) {
         const inventorydetailSearchColNumber = search.createColumn({ name: 'inventorynumber', join: 'inventoryNumber' });
         const inventorydetailSearchColInternalId = search.createColumn({ name: 'internalid', join: 'inventoryNumber' });
         const inventorydetailSearch = search.create({
                 type: 'inventorydetail',
                 filters: [['internalid', 'anyof', Detail]],
                 columns: [
                     inventorydetailSearchColNumber,
                     inventorydetailSearchColInternalId,   
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
                     Serial_S_Num: s[i].getValue({ name: 'inventorynumber',join: 'inventoryNumber'  })
                 });
             }
         }
         return DataDetail
     }

     function GetUsage() {
         var scriptObj = runtime.getCurrentScript();
         var remainingUsage = scriptObj.getRemainingUsage();
         return remainingUsage
     }
  
     function addDays(theDate, days) {

         return new Date(theDate.getTime() + days*24*60*60*1000);
      
      }

     function addMonths(date, months) {
         var new_date = FormatDate(date);
         new_date.setMonth(new_date.getMonth() + Number(months));
      
         log.debug('new_date', new_date);
         return new_date
       
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
