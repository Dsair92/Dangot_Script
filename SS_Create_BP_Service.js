var context = nlapiGetContext();
var AgreemetLinesList = [];
function BillingPlan() {
    try {
        getAgreemetLinesLoadSearch();        
        nlapiLogExecution('DEBUG', 'AgreemetLinesList ' + AgreemetLinesList.length, JSON.stringify(AgreemetLinesList));
        CreateBillingPlan(AgreemetLinesList)
    } catch (e) {
        nlapiLogExecution('error', 'error BillingPlan ', e);
    }
}
function getAgreemetLinesLoadSearch() {

    var search = nlapiLoadSearch(null, 'customsearch_bp_creation_service');
    var cols = search.getColumns();
    //var columns = new Array();
    //columns.push(new nlobjSearchColumn('custrecord_ib_agr_start_date'))
    //search.addColumns(columns);

    var resultset = search.runSearch();
    var s = [];
    var searchid = 0;
    do {
        var resultslice = resultset.getResults(searchid, searchid + 1000);

        for (var rs in resultslice) {

            s.push(resultslice[rs]);
            searchid++;
        }
    } while (resultslice != null && resultslice.length >= 1000);
    if (s != null) {
        for (var i = 0; i < s.length; i++) {
          
            AgreemetLinesList.push({
                ib_id: s[i].id,                
                agr_start_date: s[i].getValue('custrecord_ib_agr_start_date'),
                end_date: s[i].getValue(cols[4]),
                ib_excluded_warranty_month: s[i].getValue('custrecord_ib_excluded_warranty_month'),
                ib_rate: s[i].getValue('custrecord_ib_rate'),
                ib_agr: s[i].getValue('custrecord_ib_agr'),   
                agr_customer: s[i].getValue('custrecord_agr_customer', 'CUSTRECORD_IB_AGR'),  
                //ib_qty: s[i].getValue('custrecord_ib_quantity'),
                
                
            });
        }
    }
}
function CreateBillingPlan(createBPdata) {
    debugger;
    nlapiLogExecution('DEBUG', 'createBPdata: ' + createBPdata.length, JSON.stringify(createBPdata));
    try {

        for (var i = 0; i < createBPdata.length; i++) {
            Context(context)
            var rec = nlapiCreateRecord('customrecord_bp');
            //Header Fields 
            rec.setFieldValue('custrecord_bp_agr', createBPdata[i].ib_agr);
            rec.setFieldValue('custrecord_bp_customer', createBPdata[i].agr_customer);
            rec.setFieldValue('custrecord_bp_ib', createBPdata[i].ib_id);
            rec.setFieldValue('custrecord_bp_service_start_date', createBPdata[i].agr_start_date);
            rec.setFieldValue('custrecord_bp_service_end_date', createBPdata[i].end_date);
            rec.setFieldValue('custrecord_bp_rate', createBPdata[i].ib_rate);    
            rec.setFieldValue('custrecord_bp_quantity', createBPdata[i].ib_excluded_warranty_month);    
            //rec.setFieldValue('custrecord_bp_quantity', createBPdata[i].ib_qty);    
            try {
                var id = nlapiSubmitRecord(rec);
                nlapiLogExecution('debug', 'Billing Plan id: ', id);
                if (id != -1) {
                    nlapiSubmitField('customrecord_ib', createBPdata[i].ib_id,'custrecord_ib_last_billing_plan',createBPdata[i].end_date)
                }

            } catch (e) {
                nlapiLogExecution('DEBUG', 'error nlapiSubmitRecord ', e);
            }
        }
    } catch (e) {
        nlapiLogExecution('DEBUG', 'error CreateBillingPlan ', e);
    }
}
function isNullOrEmpty(val) {

    if (typeof (val) == 'undefined' || val == null || (typeof (val) == 'string' && val.length == 0)) {
        return true;
    }
    return false;
}
function Context(context) {

    //nlapiLogExecution('DEBUG', 'context.getRemainingUsage()', context.getRemainingUsage());
    if (context.getRemainingUsage() < 800) {
        nlapiLogExecution('DEBUG', 'Context', context.getRemainingUsage());
        //nlapiLogExecution('debug', 'rem usage', context.getRemainingUsage());
        var state = nlapiYieldScript();
        if (state.status == 'FAILURE') {
            nlapiLogExecution('ERROR', 'Error', ' Failed to yeild script');
        }
        else if (state.status == 'RESUME') {
            nlapiLogExecution("AUDIT", 'run', "Resuming script due to: " + state.reason + ",  " + state.size);
        }
    }

}


