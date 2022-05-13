    /**
     * @NApiVersion 2.x
     * @NScriptType ScheduledScript
     * @NModuleScope SameAccount
     */
    define(['N/search', 'N/runtime', 'N/format','N/record', 'N/task'], function(search, runtime,format, record, task) {
        var exports = {};

    


        function execute(context) {
    /*

            var scriptObj = runtime.getCurrentScript();
            var Triggerd_FF = scriptObj.getParameter('custscript_ff_id');

                title: 'Triggerd by FF ID ',
                details: params
            })
    */

            log.debug({
                title: 'context',
                details: context
            })
/*
            const BP_ID = search.createColumn({ name: 'internalid' });
            const AGR_Split_Method = search.createColumn({ name: 'custrecord_agr_split_method', join: 'CUSTRECORD_BP_AGR' });
            const IB_SO = search.createColumn({ name: 'custrecord_ib_so', join: 'CUSTRECORD_BP_IB' });
            const BP_INV_Date = search.createColumn({ name: 'custrecord_bp_date_for_inv' });
            const BP_Service_Start_Date = search.createColumn({ name: 'custrecord_bp_service_start_date' });
            const BP_Service_End_Date = search.createColumn({ name: 'custrecord_bp_service_end_date' });
            const BP_Amount = search.createColumn({ name: 'custrecord_bp_amount' });
            const INV_Group = search.createColumn({ name: 'formulatext', formula: 'DECODE({custrecord_bp_agr.custrecord_agr_split_method},\'לפי הזמנה\',Concat({custrecord_bp_customer.internalid},Concat(\'-\',{custrecord_bp_ib.custrecord_ib_so})),{custrecord_bp_customer.internalid})', sort: search.Sort.ASC });
     */       
            const FF_Search = search.load({
                id: 'customsearch_bp_to_inv'
                
            })
            var BP = [];
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
                                            BP.push({
                                                BP_ID : s[i].getValue({ name: 'internalid' }),
                                                AGR_Split_Method : s[i].getValue({ name: 'custrecord_agr_split_method', join: 'CUSTRECORD_BP_AGR' }),
                                                IB_SO : s[i].getValue({ name: 'custrecord_ib_so', join: 'CUSTRECORD_BP_IB' }),
                                                BP_INV_Date : s[i].getValue({ name: 'custrecord_bp_date_for_inv' }),
                                                BP_Service_Start_Date : s[i].getValue({ name: 'custrecord_bp_service_start_date' }),
                                                BP_Service_End_Date : s[i].getValue({ name: 'custrecord_bp_service_end_date' }),
                                                BP_Amount : s[i].getValue({ name: 'custrecord_bp_amount' }),
                                                Cust_ID : s[i].getValue({ name: 'internalid', join: 'CUSTRECORD_BP_CUSTOMER' }),
                                                IB_ID : s[i].getValue({  name: 'internalid', join: 'CUSTRECORD_BP_IB' }),
                                                AGR_ID : s[i].getValue({  name: 'internalid', join: 'CUSTRECORD_BP_AGR' }),
                                                INV_Group : s[i].getValue({ name: 'formulatext', formula: 'DECODE({custrecord_bp_agr.custrecord_agr_split_method},\'לפי הזמנה\',Concat({custrecord_bp_customer.internalid},Concat(\'-\',{custrecord_bp_ib.custrecord_ib_so})),{custrecord_bp_customer.internalid})'}),
                                                });
                                
                                    }
                                }
                                var CountJson =BP.length

                                log.debug({
                                    title: 'Total Batch Json Count:',
                                    details: CountJson
                                });
                                log.debug({
                                    title: 'Range',
                                    details: Group_to_INV(BP)
                                })
                                Create_SO(Group_to_INV(BP))

                                
                     
                        //CreateJSONPerIB(IB,CountJson);

                        
        }

        function Group_to_INV(BP){
            
          
            if (BP.length == 0){
                return
            }
            else {
                    var INV_BigArray = [];
                    var INV_Arrays = [];
                    var IBgroup = BP[0].INV_Group;
                for (var i = 0; i < BP.length; i++ ){
                    if (IBgroup == BP[i].INV_Group ){
                    INV_Arrays.push({
                        BP_ID : BP[i].BP_ID,
                        Cust_ID : BP[i].Cust_ID,
                        BP_Amount : BP[i].BP_Amount,
                        AGR_ID : BP[i].AGR_ID,
                        IB_ID : BP[i].IB_ID,
                        BP_Service_End_Date : BP[i].BP_Service_End_Date,
                        BP_Service_Start_Date : BP[i].BP_Service_Start_Date,
                    })
        
                }
                else{
                    INV_BigArray.push(INV_Arrays)
                    INV_Arrays = []
                    IBgroup = BP[i].INV_Group
                    INV_Arrays.push({
                        BP_ID : BP[i].BP_ID,
                        Cust_ID : BP[i].Cust_ID,
                        BP_Amount : BP[i].BP_Amount,
                        AGR_ID : BP[i].AGR_ID,
                        IB_ID : BP[i].IB_ID,
                        BP_Service_End_Date : BP[i].BP_Service_End_Date,
                        BP_Service_Start_Date : BP[i].BP_Service_Start_Date,
                    })
                }
                }
                INV_BigArray.push(INV_Arrays)
                    
                return INV_BigArray
            }
        }
       
        function Create_SO(Data) {
            var date = new Date();
            var TranDate = FormatDate(date);
            for (var i = 0;i < Data.length; i++){
                log.debug({
                    title: "INV:" + i,
                    details: Data[i][0].Cust_ID

                })
                
                
                var INVRec = record.create({
                    type: record.Type.INVOICE,
                    isDynamic: true,
                    defaultValues: {
                        entity: Data[i][0].Cust_ID
                    }
                });
                INVRec.setValue({
                    fieldId: 'trandate',
                    value: TranDate,
                });
                    for (var j =0;j < Data[i].length; j++){
                        INVRec.selectNewLine({
                            sublistId: 'item'
                        });
                        INVRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            value: '8545'
                        });
                        INVRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            value: '1'
                        });
                        INVRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'price',
                            value: -1
                        });
                        INVRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            value: Data[i][j].BP_Amount
                        });
                        INVRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_bs_agr',
                            value: Data[i][j].AGR_ID
                        });
                        INVRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_bs_bp',
                            value: Data[i][j].BP_ID
                        });
                        INVRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_bs_ib',
                            value: Data[i][j].IB_ID
                        });
                        INVRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_service_start_date',
                            value: FormatDate(Data[i][j].BP_Service_Start_Date)
                        });
                        INVRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_service_end_date',
                            value: FormatDate(Data[i][j].BP_Service_End_Date)
                        });
                        INVRec.commitLine({
                            sublistId: 'item'
                        })
                    }
                    try {
                        var INVID = INVRec.save({
                            ignoreMandatoryFields : true
                        })
                        log.debug({
                            title: 'INV ID:',
                            details: INVID
                        })
                        for (var j =0;j < Data[i].length; j++){
                            var BP = record.load({
                                    type: 'customrecord_bp',
                                    id: Data[i][j].BP_ID,
                                    isDynamic: false,
                                });
                                BP.setValue({
                                    fieldId: 'custrecord_bp_invoice_on',
                                    value: INVID,
                                });
                                BP.save()
                        }
                    }catch(e){
                        log.debug({
                            title: 'Creation Error',
                            details: e
                        })
                    }
                    if (GetUsage() < 100) {
                                var taskId = Reschedule();
                                log.debug({
                                    title: "Reschedule",
                                    details: '{Task ID:'+taskId 
                                })
                                return;
                            }
                
            
        }

    }

        function GetUsage(){
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

        function FormatDate(date)
        {
        var rawDateString = date;
        var parsedDate= format.parse({
            value: rawDateString,
            type: format.Type.DATE
        });
        return parsedDate
        }
        function TimeDate(date)
        {       var NewDate = format.format({
                value: date,
                type: format.Type.DATETIME,
                timezone: format.Timezone.ASIA_JERUSALEM
            });
        return NewDate
        }
        function Reschedule() {
            var scriptTask = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT});
            scriptTask.scriptId = runtime.getCurrentScript().id;
            scriptTask.deploymentId = runtime.getCurrentScript().deploymentId;
            scriptTask.submit();
        }

        
        exports.execute = execute;
        return exports;


    }
    );
    