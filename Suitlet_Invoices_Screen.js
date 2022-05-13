/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
 define(['N/search', 'N/runtime', 'N/format','N/record', 'N/task','N/http','N/ui/serverWidget','N/log'], function(search, runtime,format, record, task,http,serverWidget,log) {
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
                title : 'Simple Form'
            });
            var sublist = form.addSublist({
                id : 'sublist',
                type : serverWidget.SublistType.LIST,
                label : 'Billing Plan Summary'
            });
            var filter_group = form.addFieldGroup({
                id : 'filter_group',
                label : 'Customer Filter'
            });
                form.addField({
                    id: 'select_cust',
                    label: 'Customer',
                    type: serverWidget.FieldType.SELECT,
                    source: 'customer',
                    container: 'filter_group'
                })
                sublist.addField({
                    id: 'custfield_selected',
                    type : serverWidget.FieldType.CHECKBOX,
                    label: 'Select'
                })
                sublist.addMarkAllButtons();
               
                sublist.addField({
                id: 'name',
                type: serverWidget.FieldType.TEXT,
                label: 'Customer'
                })
                sublist.addField({
                    id: 'amount',
                    type: serverWidget.FieldType.INTEGER,
                    label: 'Amount'
                    })
            var SearchData = GetSearch()
            log.debug({
                title: 'Search Data',
                details: SearchData
            })
            for (var i = 0;i < SearchData.length; i++){
                sublist.setSublistValue({
                    id: 'name',
                    line: SearchData[i].Line,
                    value: SearchData[i].companyname
                })
                sublist.setSublistValue({
                    id: 'amount',
                    line: SearchData[i].Line,
                    value: SearchData[i].amount
                })
            }
/*
            var list = form.addSublist({
                title : 'Invoice Cusotmer'
            });
            list.addColumn({
                id : 'companyname',
                type : serverWidget.FieldType.TEXT,
                label : 'Customer Name',
                });
          
            list.addColumn({
                id : 'amount',
                type : serverWidget.FieldType.CURRENCY,
                label : 'Amount',
                });
           
            list.addRows({
                rows: GetSearch()
            })
           */
            context.response.writePage({
                pageObject: form
                })
        }
                
      
        
    }


    function GetSearch(){
        log.audit({
            title: 'search',
       })
       var bp_search = search.load({
           id: 'customsearch_suitlet_bp'
           
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
                                        companyname : s[i].getValue({ name: 'companyname', join: 'CUSTRECORD_BP_CUSTOMER', summary: search.Summary.GROUP }),
                                        amount : Number(s[i].getValue({ name: 'custrecord_bp_amount', summary: search.Summary.SUM }))
                                   })
                                }
                            }
       return BP
           
       

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
    
    
              
    exports.onRequest = onRequest;
    return exports;


}
);
   
 /*
            list.addColumn({
                id: 'Company_Name',
                label: 'Company Name',
                type: serverWidget.FieldType.TEXT,
            })
            /*
            list.addColumn({
                id: 'Amount',
                label: 'Amount',
                type: serverWidget.FieldType.TEXT,
            })
            /*
            var fieldContainer = form.addFieldGroup({
                id: 'fieldContainer',
                label: 'Field Container',
                });

            var fname =form.addField({
                id: 'name',
                label: 'Name',
                type: serverWidget.FieldType.TEXT,
                container: 'string'
                })
                
            form.addResetButton({
                label: 'Reset'
                })
                
            form.addSubmitButton({
                label: 'Submit'
                })
               */