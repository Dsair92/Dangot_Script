var screenType;
function ActionScreen(request, response) {
    if (request.getParameter('custpage_page') == '1') {
        var action = request.getParameter('custpage_action');
        var lineCount = request.getLineItemCount('custpage_res_sublist');
        var dataToUpdate = [];
        var dataToRemove = [];
        if (action == 1) {
            var status = request.getParameter('custpage_status');
            for (var i = 0; i < lineCount; i++) {
                selected = request.getLineItemValue('custpage_res_sublist', 'custpage_process', i + 1);
                if (selected == 'T') {
                    dataToUpdate.push({
                        ib_id: request.getLineItemValue('custpage_res_sublist', 'custpage_ib_id', i + 1),
                        renewal_amount: request.getLineItemValue('custpage_res_sublist', 'custpage_ib_renewal_amount', i + 1),
                        discount: request.getLineItemValue('custpage_res_sublist', 'custpage_discount', i + 1),
                        charge_type: request.getLineItemValue('custpage_res_sublist', 'custpage_charge_type_select', i + 1),
                    });
                }
                else {
                    dataToRemove.push({
                        ib_id: request.getLineItemValue('custpage_res_sublist', 'custpage_ib_id', i + 1),
                    });
                }
            }
        }
        else {
            var agr_target = request.getParameter('custpage_agr_target');
            var cust_target = request.getParameter('custpage_cust_target');
            var status = request.getParameter('custpage_status_target');
            for (var i = 0; i < lineCount; i++) {
                selected = request.getLineItemValue('custpage_res_sublist', 'custpage_process', i + 1);
                if (selected == 'T') {
                    dataToUpdate.push({
                        ib_id: request.getLineItemValue('custpage_res_sublist', 'custpage_ib_id', i + 1),
                        agr_target: agr_target,
                        cust_target: cust_target,
                        renewal_amount: request.getLineItemValue('custpage_res_sublist', 'custpage_ib_renewal_amount', i + 1),
                    });
                }
            }
        }
        var today = new Date();
        var todayStr = nlapiDateToString(today);
        var form = nlapiCreateForm('Number Of lines Checked: ' + dataToUpdate.length);
        nlapiLogExecution('debug', 'dataToUpdate: ' + dataToUpdate.length, JSON.stringify(dataToUpdate))
        nlapiLogExecution('debug', 'action: ', action)

        var params = {
            custscript_renewal_action: action,
            custscript_renewal_data: JSON.stringify(dataToUpdate),
            custscript_renewal_remove_data: JSON.stringify(dataToRemove),
            custscript_renewal_status: status,
        };
        nlapiScheduleScript('customscript_renewal_agr_ss', null, params);
        if (action == 2) {
            nlapiSetRedirectURL('record', 'customrecord_agr', agr_target, 'view', null);
        }
        else {
            var htmlHeader = form.addField('custpage_header', 'inlinehtml').setLayoutType('outsideabove', 'startrow');
            htmlHeader.setDefaultValue("<p style='font-size:20px'>The Invoice transactions are currently being created.</p><br><br>Please click <a href='https://system.eu1.netsuite.com/app/common/scripting/scriptstatus.nl?sortcol=dcreated&sortdir=DESC&date=TODAY&datefrom=" + todayStr + "&dateto=" + todayStr + "&scripttype=" + getScriptID() + "&primarykey=539' target='_blank' >here</a> in order to be redirected to the status page.");

        }

        response.writePage(form)
    }
    else {
        screenType = request.getParameter('screenType');
        if (isNullOrEmpty(screenType)) { screenType = request.getParameter('custpage_screen_type'); }
        var form = nlapiCreateForm(buildFormName(screenType));
        form.addSubmitButton('Refresh');
        form.setScript('customscript_renewal_agr_cs');
        form.addFieldGroup('custpage_batch_group', 'Select Details');

        var customer = form.addField('custpage_customer', 'select', 'customer', 'customer', 'custpage_batch_group').setLayoutType('midrow');
        var customer_data = request.getParameter('custpage_customer');

        customer.setDefaultValue(customer_data)
        customer.setMandatory(true);

        var action = form.addField('custpage_action', 'select', 'Action', null, 'custpage_batch_group').setLayoutType('midrow');
        action.addSelectOption('1', 'עריכת הסכם')
        action.addSelectOption('2', 'צירוף שורות')
        var action_data = request.getParameter('custpage_action');
        action.setDefaultValue(action_data)
        action.setMandatory(true);

        var status = form.addField('custpage_status', 'select', 'Status', '', 'custpage_batch_group').setLayoutType('midrow');
        status.addSelectOption('2', 'טיוטא')
        status.addSelectOption('1', 'פעיל')
        var status_data = request.getParameter('custpage_status');
        status.setDefaultValue(status_data)
        status.setMandatory(true);
        if (screenType == 2) {
            status.setDefaultValue('1')
            status.setDisplayType('hidden');
        }

        if (screenType == 2) {
            var sub_type = form.addField('custpage_sub_type', 'select', 'Sub Type', 'customlist_agreement_sub_type', 'custpage_batch_group').setLayoutType('midrow');
            var sub_type_data = request.getParameter('custpage_sub_type');
            sub_type.setDefaultValue(sub_type_data)
        }

        var agr = form.addField('custpage_agr', 'select', 'Agreement', null, 'custpage_batch_group').setLayoutType('midrow');
        var agr_data = request.getParameter('custpage_agr');
        if (!isNullOrEmpty(customer_data))
            setAgr(customer_data, status_data, agr, 1, screenType);
        agr.setDefaultValue(agr_data);


        var item = form.addField('custpage_item', 'select', 'ITEM', 'item', 'custpage_batch_group').setLayoutType('midrow');
        var item_data = request.getParameter('custpage_item');
        item.setDefaultValue(item_data)

        var employee = form.addField('custpage_employee', 'select', 'Employee', 'employee', 'custpage_batch_group').setLayoutType('midrow');
        var employee_data = request.getParameter('custpage_employee');
        employee.setDefaultValue(employee_data)


        var cust_target = form.addField('custpage_cust_target', 'select', 'Target Customer', 'customer', 'custpage_batch_group').setLayoutType('outside');
        var cust_target_data = request.getParameter('custpage_cust_target');
        cust_target.setDefaultValue(cust_target_data);

        var status_target = form.addField('custpage_status_target', 'select', 'Target Status', '', 'custpage_batch_group').setLayoutType('outside');
        status_target.addSelectOption('2', 'טיוטא')
        status_target.addSelectOption('1', 'פעיל')
        var status_target_data = request.getParameter('custpage_status_target');
        status_target.setDefaultValue(status_target_data)
        status_target.setMandatory(true);
        if (screenType == 2) {
            status_target.setDefaultValue('1')
            status_target.setDisplayType('hidden');
        }

        var agr_2 = form.addField('custpage_agr_target', 'select', 'Target Agreement', null, 'custpage_batch_group').setLayoutType('outside');
        var agr_data_2 = request.getParameter('custpage_agr_target');
        if (!isNullOrEmpty(cust_target_data))
            setAgr(cust_target_data, status_target_data, agr_2, 2, screenType);
        agr_2.setDefaultValue(agr_data_2);

        var precent = form.addField('custpage_percent', 'FLOAT', 'Percent', null, 'custpage_batch_group').setLayoutType('outside');
        var precent_data = request.getParameter('custpage_percent');
        precent.setDefaultValue(precent_data)

        var amount = form.addField('custpage_change_amount', 'FLOAT', 'Change Amount', null, 'custpage_batch_group').setLayoutType('outside');
        var amount_data = request.getParameter('custpage_change_amount');
        amount.setDefaultValue(amount_data)

        var charge_type = form.addField('custpage_charge_type', 'select', 'Charge Type', 'customlist_dangot_recurr_charge_type', 'custpage_batch_group').setLayoutType('outside');
        var charge_type_data = request.getParameter('custpage_charge_type');
        charge_type.setDefaultValue(charge_type_data)

        form.addField('custpage_page', 'text', 'Next Page', null, null).setDisplayType('hidden');
        nlapiLogExecution('debug', ' action_data ', action_data)
        var results = [];
        if (action_data == 1) { // עריכת הסכם
            results = getAgreementLines(status_data, agr_data, item_data, parseFloat(precent_data), sub_type_data, amount_data, charge_type_data);
            if (results.length > 0) {
                form.addButton('customscript_continue', 'Continue', 'Continue()');
                form.addButton('customscript_export', 'Export', 'fnExcelReport()');
                form.addFieldGroup('custpage_timesheet_group', 'List');
                var subList = form.addSubList('custpage_res_sublist', 'list', 'number of results: ' + results.length, 'custpage_timesheet_group');
                subList.addMarkAllButtons()
                subList.addField('custpage_process', 'checkbox', 'Choose')
                subList.addField('custpage_ib_id_view', 'text', 'Install Base');
                subList.addField('custpage_ib_id', 'text', 'Install Base').setDisplayType('hidden');;
                subList.addField('custpage_ib_item', 'text', 'Item');
                subList.addField('custpage_ib_description', 'text', 'Description');
                subList.addField('custpage_ib_serial', 'text', 'Serial');
                subList.addField('custpage_ib_rate', 'text', 'Rate');
                subList.addField('custpage_ib_charge_type', 'text', 'Charge Type');
                subList.addField('custpage_ib_renewal_amount', 'CURRENCY', 'renewal amount').setDisplayType('entry');
                subList.addField('custpage_charge_type_select', 'select', 'Charge Type', 'customlist_dangot_recurr_charge_type');
                var month_warr_field = subList.addField('custpage_exclude_month_warr', 'text', 'Exclude Month Warranty')
                subList.addField('custpage_discount', 'percent', 'Discount').setDisplayType('entry');
                subList.addField('custpage_charge_amount', 'float', 'Charge Amount')//.setDisplayType('entry');
                subList.addField('custpage_agr_line_id', 'text', 'AGREEMENT LINE').setDisplayType('hidden');
                if (screenType == 2) { month_warr_field.setDisplayType('hidden'); }
                for (var i = 0; i < results.length; i++) {
                    subList.setLineItemValue('custpage_process', i + 1, 'T');
                    subList.setLineItemValue('custpage_update', i + 1, 'T');
                    subList.setLineItemValue('custpage_ib_id', i + 1, results[i].ib_id);
                    subList.setLineItemValue('custpage_ib_id_view', i + 1, results[i].ib_id_view);
                    subList.setLineItemValue('custpage_ib_item', i + 1, results[i].ib_item);
                    subList.setLineItemValue('custpage_ib_description', i + 1, results[i].ib_description);
                    subList.setLineItemValue('custpage_ib_serial', i + 1, results[i].ib_serial);
                    subList.setLineItemValue('custpage_ib_rate', i + 1, results[i].ib_rate);
                    subList.setLineItemValue('custpage_ib_renewal_amount', i + 1, results[i].ib_renewal_amount);
                    subList.setLineItemValue('custpage_exclude_month_warr', i + 1, results[i].exclude_month_warr);
                    subList.setLineItemValue('custpage_ib_charge_type', i + 1, results[i].ib_charge_type);
                    subList.setLineItemValue('custpage_discount', i + 1, results[i].discount);
                    subList.setLineItemValue('custpage_charge_amount', i + 1, results[i].charge_amount);
                    subList.setLineItemValue('custpage_charge_type_select', i + 1, results[i].ib_charge_type_select);

                }
            }
        }
        else if (action_data == 2) { // צירוף שורות
            results = getAgreementLinesMove(customer_data, agr_data, item_data, parseFloat(precent_data), sub_type_data, amount_data, charge_type_data);
            if (results.length > 0) {
                form.addButton('customscript_continue', 'Continue', 'Continue()');
                form.addButton('customscript_export', 'Export', 'fnExcelReport()');
                form.addFieldGroup('custpage_timesheet_group', 'List');
                var subList = form.addSubList('custpage_res_sublist', 'list', 'number of results: ' + results.length, 'custpage_timesheet_group');
                subList.addMarkAllButtons()
                subList.addField('custpage_process', 'checkbox', 'Choose')
                subList.addField('custpage_ib_id', 'text', 'Install Base');
                subList.addField('custpage_ib_item', 'text', 'Item');
                subList.addField('custpage_ib_description', 'text', 'Description');
                subList.addField('custpage_ib_serial', 'text', 'Serial');
                subList.addField('custpage_agr', 'text', 'Agreement');
                subList.addField('custpage_ib_rate', 'text', 'Rate');
                subList.addField('custpage_ib_charge_type', 'text', 'Charge Type');
                subList.addField('custpage_ib_renewal_amount', 'CURRENCY', 'renewal amount').setDisplayType('entry');
                subList.addField('custpage_charge_type_select', 'select', 'Charge Type', 'customlist_dangot_recurr_charge_type');
                subList.addField('custpage_exclude_month_warr', 'text', 'Exclude Month Warranty')
                subList.addField('custpage_disabled', 'text', 'disabled').setDisplayType('hidden');
                for (var i = 0; i < results.length; i++) {
                    var process = 'T'
                    var disabled = results[i].disabled
                    if (disabled == 'T') { process = 'F' }
                    subList.setLineItemValue('custpage_process', i + 1, process);
                    subList.setLineItemValue('custpage_ib_id', i + 1, results[i].ib_id);
                    subList.setLineItemValue('custpage_ib_item', i + 1, results[i].ib_item);
                    subList.setLineItemValue('custpage_ib_description', i + 1, results[i].ib_description);
                    subList.setLineItemValue('custpage_ib_serial', i + 1, results[i].ib_serial);
                    subList.setLineItemValue('custpage_agr', i + 1, results[i].agr);
                    subList.setLineItemValue('custpage_ib_rate', i + 1, results[i].ib_rate);
                    subList.setLineItemValue('custpage_ib_renewal_amount', i + 1, results[i].ib_renewal_amount);
                    subList.setLineItemValue('custpage_exclude_month_warr', i + 1, results[i].exclude_month_warr);
                    subList.setLineItemValue('custpage_disabled', i + 1, disabled)
                    subList.setLineItemValue('custpage_charge_type_select', i + 1, results[i].ib_charge_type_select);
                    subList.setLineItemValue('custpage_ib_charge_type', i + 1, results[i].ib_charge_type);
                }
            }
        }

        var screen_type = form.addField('custpage_screen_type', 'text', 'check', null, null);
        screen_type.setDefaultValue(screenType);
        screen_type.setDisplayType('hidden');

        response.writePage(form);
    }
}//end of suitlet

//Renewal Agreement
function getAgreementLines(status_data, agr_data, item_data, percent, sub_type_data, amount_data, charge_type_data) {

    nlapiLogExecution('debug', ' status_data: ' + status_data, 'agr_data: ' + agr_data)
    if (status_data == 1) { // פעיל
        var searchStr = 'customsearch_as_active_line'
    }
    else {
        var searchStr = 'customsearch_ac_draft_line'
    }
    var search = nlapiLoadSearch(null, searchStr);

    if (!isNullOrEmpty(item_data)) { search.addFilter(new nlobjSearchFilter('custrecord_ib_item', null, 'anyof', item_data)) }
    if (status_data == 1) { // פעיל
        search.addFilter(new nlobjSearchFilter('custrecord_ib_agr', null, 'anyof', agr_data))
    }
    else { // DRAFT
        search.addFilter(new nlobjSearchFilter('custrecord_ib_new_agreement', null, 'anyof', agr_data))
    }
    if (!isNullOrEmpty(sub_type_data)) { search.addFilter(new nlobjSearchFilter('custrecord_agr_sub_type', 'custrecord_ib_agr', 'anyof', sub_type_data)) }

    var columns = new Array();
    columns.push(new nlobjSearchColumn('custrecord_ib_serial_number'))
    search.addColumns(columns);

    var agrLineList = [];
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
        if (status_data == 1) {
            var field = 'custrecord_ib_excluded_warranty_month'
            var CHARGE_TYPE_FIELD = 'custrecord_ib_charge_type'
            var rate = 'custrecord_ib_rate'
        }
        else { // DRAFT
            var field = 'custrecordib_next_agr_exclude_month_warr';
            var CHARGE_TYPE_FIELD = 'custrecord_ib_charge_type_renewal'
            var rate = 'custrecord_ib_renewal_amount'
        }
        for (var i = 0; i < s.length; i++) {

            if (!isNullOrEmpty(amount_data)) renewal_amount = amount_data
            else renewal_amount = NewSum(s[i].getValue(rate), percent);          
            if (screenType == 2) { exclude_month_warr = 12 }
            else { exclude_month_warr = s[i].getValue(field); }
            if (!isNullOrEmpty(charge_type_data)) charge_type = charge_type_data
            else charge_type = s[i].getValue(CHARGE_TYPE_FIELD)
            discount1 = s[i].getValue('custrecord_ib_discount');

            agrLineList.push({
                ib_id_view: GetLink(s[i].getValue('name'), s[i].id, 'customrecord_ib'),
                ib_id: s[i].id,
                ib_renewal_amount: renewal_amount,
                ib_rate: s[i].getValue(rate),
                exclude_month_warr: exclude_month_warr,
                ib_item: s[i].getText('custrecord_ib_item'),
                ib_serial: s[i].getValue('custrecord_ib_serial_number_s'),
                ib_description: s[i].getValue('custrecord_ib_description'),
                ib_charge_type: s[i].getText(CHARGE_TYPE_FIELD),
                ib_charge_type_select: charge_type,
                discount: discount1,
                charge_amount: chargeAmtCalc(renewal_amount, exclude_month_warr, discount1),





            });
        }
    }
    return agrLineList;
}
//BS_Move IB
function getAgreementLinesMove(customer, agr_data, item_data, percent, sub_type_data, amount_data, charge_type_data) {

    var search = nlapiLoadSearch(null, 'customsearch_move_ib');
    if (!isNullOrEmpty(customer)) { search.addFilter(new nlobjSearchFilter('custrecord_ib_customer', null, 'anyof', customer)) }
    if (!isNullOrEmpty(item_data)) { search.addFilter(new nlobjSearchFilter('custrecord_ib_item', null, 'anyof', item_data)) }
    if (!isNullOrEmpty(agr_data)) { search.addFilter(new nlobjSearchFilter('custrecord_ib_agr', null, 'anyof', agr_data)) }
    if (!isNullOrEmpty(sub_type_data)) { search.addFilter(new nlobjSearchFilter('custrecord_agr_sub_type', 'custrecord_ib_agr', 'anyof', sub_type_data)) }

    var columns = new Array();
    columns.push(new nlobjSearchColumn('custrecord_ib_serial_number'))
    search.addColumns(columns);

    var agrLineList = [];
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

    var CHARGE_TYPE_FIELD = 'custrecord_ib_charge_type'
    
    if (s != null) {
        for (var i = 0; i < s.length; i++) {
            if (!isNullOrEmpty(amount_data)) renewal_amount = amount_data;
            else renewal_amount = NewSum(s[i].getValue('custrecord_ib_rate'), percent); 
            if (!isNullOrEmpty(charge_type_data)) charge_type = charge_type_data
            else charge_type = s[i].getValue(CHARGE_TYPE_FIELD)
            agrLineList.push({
                ib_id: s[i].id,
                agr: GetLink(s[i].getText('custrecord_ib_agr'), s[i].getValue('custrecord_ib_agr'), 'customrecord_agr'),
                ib_renewal_amount: renewal_amount,
                ib_rate: s[i].getValue('custrecord_ib_rate'),
                ib_description: s[i].getValue('custrecord_ib_description'),
                exclude_month_warr: s[i].getValue('custrecord_ib_excluded_warranty_month'),
                disabled: s[i].getValue('formulatext'),
                ib_item: s[i].getText('custrecord_ib_item'),
                ib_serial: s[i].getValue('custrecord_ib_serial_number_s'),
                ib_charge_type: s[i].getText(CHARGE_TYPE_FIELD),
                ib_charge_type_select: charge_type,
            });
        }
    }
    return agrLineList;
}
function NewSum(cuuRate, percent) {
    //nlapiLogExecution('DEBUG', 'percent:' + percent, 'cuuRate' + cuuRate );
    if (!isNullOrEmpty(percent) && !isNullOrEmpty(cuuRate)) {
        cuuRate = Number(cuuRate) + (Number(cuuRate) * Number(percent)) / 100;
        cuuRate = cuuRate.toFixed(2);
    }
    else if (!isNullOrEmpty(cuuRate)) { cuuRate = Number(cuuRate).toFixed(2) }
    else if (isNullOrEmpty(cuuRate)) {
        return 0
    }

    return cuuRate;

}
function GetLink(name, id, type) {
    var link = "<a href='https://system.netsuite.com" + nlapiResolveURL('RECORD', type, id) + "'" + ' target="_blank">' + name + "</a>";
    return link;
}
function setAgr(customer_data, status_data, field, typeField, screenType) {
    var agrList = customer_agr(customer_data, status_data, screenType);
    if (agrList.length > 0) {
        if (typeField == 1) { field.addSelectOption('', '', false) }
        for (var i = 0; i < agrList.length; i++) {
            field.addSelectOption(agrList[i].id, agrList[i].name, false)
        }
    }
}
function customer_agr(customer, status, screenType) {

    var columns = new Array();
    columns[0] = new nlobjSearchColumn('name');

    var filters = new Array();
    filters[0] = new nlobjSearchFilter('custrecord_agr_customer', null, 'is', customer)
    filters[1] = new nlobjSearchFilter('isinactive', null, 'is', 'F')
    filters[2] = new nlobjSearchFilter('custrecord_agr_status', null, 'anyof', status)
    filters[3] = new nlobjSearchFilter('custrecord_agr_type', null, 'anyof', screenType)

    var search = nlapiCreateSearch('customrecord_agr', filters, columns);

    var resultset = search.runSearch();
    var s = [];
    var searchid = 0;
    var results = [];
    do {
        var resultslice = resultset.getResults(searchid, searchid + 1000);
        for (var rs in resultslice) {
            s.push(resultslice[rs]);
            searchid++;
        }
    } while (resultslice != null && resultslice.length >= 1000);
    if (s != null) {
        for (var i = 0; i < s.length; i++) {
            results.push({
                id: s[i].id,
                name: s[i].getValue('name'),
            });
        }
        return results;
    }
}
function isNullOrEmpty(val) {

    if (typeof (val) == 'undefined' || (typeof (val) != 'string' && isNaN(val)) || val == null || (typeof (val) == 'string' && val.length == 0)) {
        return true;
    }
    return false;
}

function getScriptID() {
    var scriptSearch = nlapiSearchRecord("script", null,
        [
            ["scriptid", "is", "customscript_renewal_agr_ss"]
        ],
        [
            new nlobjSearchColumn("scriptid")
        ]
    );
    return scriptSearch[0].id
}
function chargeAmtCalc(renewal_amount, exclude_month_warr, discount) {
    var clc = (renewal_amount / 12) * exclude_month_warr;
    if (!isNullOrEmpty(discount)) {
        discount = Number(discount.substring(0, discount.length - 1))
        clc = ((100 - discount) * clc) / 100;
    }
    return clc.toFixed(2);
}
function buildFormName(screenType) {
    var formName = 'Action Screen'
    if (screenType == 1) { formName += ' Service' }
    else if (screenType == 2) { formName += ' Recurring' }
    return formName
}


