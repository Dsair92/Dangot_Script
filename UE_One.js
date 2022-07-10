/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
 define(['N/ui/serverWidget'],
function (serverWidget) {
    function beforeLoad(context) {
        var rec = context.newRecord;
        var recType = rec.type;
        if ((recType == 'salesorder' || recType == 'estimae') && context.type == 'edit') {
            //context.form.clientScriptFileId = 542668; 
            context.form.clientScriptModulePath = 'SuiteScripts/Billing System/CL_Sourcing Field Value.js';

            var sublist = context.form.getSublist("item")
            var rate = sublist.getField({id: 'rate'});
            rate.isDisabled = true
            /*
            sublist.addButton({
                id: 'custpage_update_price',
                label: 'Update Price',
                functionName: 'updatePrice'
            });
            context.form.addField({
                id: 'custpage_disabled_client_func',
                label: 'Hidden',
                type: serverWidget.FieldType.CHECKBOX
            })
            */
        }
    }
    function beforeSubmit(context) {
        try {
            if (context.type != context.UserEventType.DELETE) {
                var rec = context.newRecord;
                var recType = rec.type;
                if (recType == 'salesorder') {
                    var ismultishipto = rec.getValue('ismultishipto');
                    if (!ismultishipto) {
                        var end_customer = rec.getValue('custbody_end_customer');
                        if (!isNullOrEmpty(end_customer)) {
                            var lineCount = rec.getLineCount({ sublistId: 'item' });
                            for (var i = 0; i < lineCount; i++) {
                                var item_display = rec.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'item_display',
                                    line: i,
                                });
                                if (item_display != 'End of Group') {
                                    rec.setSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_end_customer',
                                        line: i,
                                        value: end_customer
                                    });

                                }
                            }
                        }
                    }
                }                  
            }
        } catch (e) { }
    }
    function isNullOrEmpty(val) {

        if (typeof (val) == 'undefined' || val == null || (typeof (val) == 'string' && val.length == 0)) {
            return true;
        }
        return false;
    }
    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
    };
});