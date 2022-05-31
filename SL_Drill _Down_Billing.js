/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
 define(['N/search', 'N/runtime', 'N/format','N/record', 'N/task','N/http','N/ui/serverWidget','N/redirect','N/url','N/log'], function(search, runtime,format, record, task,http,serverWidget,redirect,url,log) {
    var exports = {};

    /**
     * 
     * @param context
     *       {object}
     * @param context.Request
     *        {ServerRequest}
     *  @param context.Response 
     *        {ServerResponse}
     * @return {void}  
     * @static
     * @function onRequest 
     */

    function onRequest(context) {
        log.debug({
            title: 'Test',
            details: context
        })
        if (context.request.method === 'GET'){
            var form = serverWidget.createForm({
                title : 'Billing Detail'
            });
            //var Current_Script = runtime.getCurrentScript()
            var Customer = parseInt(context.request.parameters.custscript_cust)
            var Agr = parseInt(context.request.parameters.custscript_agr)
            var bp_date = context.request.parameters.custscript_end_date

            log.debug({
                title: 'bp_date',
                details: bp_date
            })
            
            //Customer = 4243
            //var Agr = 1427
            var Total_Amount = 0
            var sublist = form.addSublist({
                id : 'sublist',
                type : serverWidget.SublistType.LIST,
                label : 'Billing Plan Detail'
                });
                 form.addFieldGroup({
                id : 'filter_group',
                label : 'Customer Filter'
                });
                var Cust_Field = form.addField({
                    id: 'cust_field',
                    label: 'Customer',
                    type: serverWidget.FieldType.SELECT,
                    source: 'customer',
                    container: 'filter_group'
                })
                
                Cust_Field.defaultValue = Customer
                Cust_Field.updateDisplayType({displayType : serverWidget.FieldDisplayType.INLINE});
                var Agr_Field = form.addField({
                    id: 'agr_field',
                    label: 'Agreement',
                    type: serverWidget.FieldType.SELECT,
                    source: 'customrecord_agr',
                    container: 'filter_group'
                })
                
                Agr_Field.defaultValue = Agr
                Agr_Field.updateDisplayType({displayType : serverWidget.FieldDisplayType.INLINE});
                var Bp_date_Field = form.addField({
                    id: 'select_date',
                    label: 'Billing On Date',
                    type: serverWidget.FieldType.DATE,
                    container: 'filter_group'
                })
                Bp_date_Field.defaultValue = bp_date
                Bp_date_Field.updateDisplayType({displayType : serverWidget.FieldDisplayType.INLINE});
                var Total_Agr = form.addField({
                    id: 'total',
                    label: 'Total Amount',
                    type: serverWidget.FieldType.CURRENCY,
                    container: 'filter_group'
                })
                
                Total_Agr.updateDisplayType({displayType : serverWidget.FieldDisplayType.INLINE});
                
                sublist.addField({
                    id: 'bp',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Billing Plan'
                })    
                sublist.addField({
                id: 'item',
                type: serverWidget.FieldType.TEXT,
                label: 'item'
                })
                sublist.addField({
                    id: 'serial',
                    type: serverWidget.FieldType.TEXT,
                    label: 'serial'
                })
                sublist.addField({
                    id: 'service_start_d',
                    type: serverWidget.FieldType.DATE,
                    label: 'Service Start Date'
                })
                sublist.addField({
                    id: 'service_end_d',
                    type: serverWidget.FieldType.DATE,
                    label: 'Service End Date'
                })
                sublist.addField({
                    id: 'inv_date',
                    type: serverWidget.FieldType.DATE,
                    label: 'Billing On Date'
                })
                sublist.addField({
                    id: 'amount',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Amount'
                })
            var SearchData = GetSearch(Customer,Agr,bp_date)
            log.debug({
                title: 'Search Data',
                details: SearchData
            })
            if (SearchData.length > 0){
            for (var i = 0;i < SearchData.length; i++){
                sublist.setSublistValue({
                    id: 'bp',
                    line: SearchData[i].Line,
                    value: Record_Link('customrecord_bp',SearchData[i].BP_ID,false,SearchData[i].BP_Name)
                })
                sublist.setSublistValue({
                    id: 'item',
                    line: SearchData[i].Line,
                    value: SearchData[i].item
                })
                if (!isNullOrEmpty(SearchData[i].serial)){
                    sublist.setSublistValue({
                        id: 'serial',
                        line: SearchData[i].Line,
                        value: SearchData[i].serial
                    })
                }
                log.debug({
                    title: 'Serial',
                    details: 'Serial'
                })
                sublist.setSublistValue({
                    id: 'service_start_d',
                    line: SearchData[i].Line,
                    value: SearchData[i].start_date
                })
                sublist.setSublistValue({
                    id: 'service_end_d',
                    line: SearchData[i].Line,
                    value: SearchData[i].end_date
                })
                sublist.setSublistValue({
                    id: 'inv_date',
                    line: SearchData[i].Line,
                    value: SearchData[i].inv_date
                })
                log.debug({
                    title: 'Test',
                    details: 'test'
                })
                sublist.setSublistValue({
                    id: 'amount',
                    line: SearchData[i].Line,
                    value: SearchData[i].amount
                })
                Total_Amount += SearchData[i].amount
            }

            Total_Agr.defaultValue = Total_Amount
            context.response.writePage({
                pageObject: form
                })
            }
        }
                
        else {
                var request = context.request
                var customer =  request.parameters.select_cust
                
        
        }
    }

    function GetSearch(Customer,Agr,Date){
        log.audit({
            title: 'search',
       })
       var filter_search = [['custrecord_bp_customer', 'anyof', Customer],'AND',['custrecord_bp_agr', 'anyof', Agr],'AND',['custrecord_bp_invoice_on', 'anyof', '@NONE@']]
       if (!isNullOrEmpty(Date)){
            filter_search.push('AND',['custrecord_bp_date_for_inv','onorbefore',Date])
       }
       var bp_search = search.create({
           type: 'customrecord_bp',
           filters: filter_search,
           columns: [{name: 'name'},{name: 'custrecord_bp_service_start_date'},{name: 'custrecord_bp_service_end_date'},{name: 'custrecord_bp_amount'},{name: 'custrecord_bp_date_for_inv'},{ name: 'custrecord_ib_item', join: 'CUSTRECORD_BP_IB' }
        ,{ name: 'custrecord_ib_serial_number', join: 'CUSTRECORD_BP_IB' }],
           })
       var BP = [];
                   var resultset = bp_search.run();
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
                                        Line : i,
                                        BP_ID: s[i].id,
                                        BP_Name: s[i].getValue({name: 'name'}),
                                        start_date : s[i].getValue({ name: 'custrecord_bp_service_start_date'}),
                                        end_date : s[i].getValue({name: 'custrecord_bp_service_end_date'}),
                                        inv_date : s[i].getValue({ name: 'custrecord_bp_date_for_inv'}),
                                        item : s[i].getText({ name: 'custrecord_ib_item', join: 'CUSTRECORD_BP_IB' }),
                                        serial : s[i].getText({ name: 'custrecord_ib_serial_number', join: 'CUSTRECORD_BP_IB' }),
                                        amount : Number(s[i].getValue({ name: 'custrecord_bp_amount' }))
                                   })
                                }
                            }
       return BP
           
       

    }
    
    function Refresh(context) {
        var request = context.request
        var customer =  request.parameters.select_cust
    }
    function isNullOrEmpty(val) {

    if (typeof (val) == 'undefined' || val == null || (typeof (val) == 'string' && val.length == 0)) {
        return true;
    }
    return false;
    }

     
    function Record_Link(type,id,editmode,name){
        
        var link = "<a href='https://system.netsuite.com" + url.resolveRecord({isEditMode: editmode,recordId: id,recordType: type,}) +  "'" + ' target="_blank">' + name + "</a>";
        
        return link
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
    
    
              
    exports.onRequest = onRequest;
    return exports;


}
);
   

