var GLOBAL_METHOD = 1; //Credit Guard
var context = nlapiGetContext()
var globalSettings = [];
function credit_guard_screen(request, response) {   
    nlapiLogExecution('DEBUG', 'SCRIPT', 'RUN');
    try {
        var form = nlapiCreateForm('Credit Guard');
        form.addFieldGroup('custpage_searchdetails', 'Details');

        if (request.getMethod() == 'GET') {
            //****************************************************First Charge*********************************************************
            nlapiLogExecution('DEBUG', 'stage one', 'stage one');

            nlapiLogExecution('DEBUG', 'request.getParameter(cardid)', request.getParameter('cardid'));
            nlapiLogExecution('DEBUG', 'isEmpty(request.getParameter(cardid))', isEmpty(request.getParameter('cardid')));


            var customer = form.addField('custpage_customer', 'select', 'Customer ', 'customer');
            customer.setMandatory(true);
            customer.setDefaultValue(request.getParameter('custid'));
            customer.setDisplayType('inline');



            if (isEmpty(request.getParameter('cardid')) == true) {
                nlapiLogExecution('DEBUG', 'cardid', 'is empty');
                var isempty_checkbox = form.addField('custpage_checkbox', 'checkbox');
                isempty_checkbox.setDefaultValue('F');
                isempty_checkbox.setDisplayType('hidden');

                var standing_order_checkbox = form.addField('custpage_standing_order', 'checkbox', 'standing order');
                standing_order_checkbox.setDefaultValue('F');



                var cardId = form.addField('custpage_cardid', 'text', 'Card Number');
                cardId.setMandatory(true);
                var expdate = form.addField('custpage_expdate', 'text', 'Expiration Date - MMYY');
                expdate.setMandatory(true);
                var cvv = form.addField('custpage_cvv', 'text', 'CVV');
                var id = form.addField('custpage_id', 'text', 'ID Number');


            }
            else {
                nlapiLogExecution('DEBUG', 'cardid', 'is not empty');
                var isempty_checkbox = form.addField('custpage_checkbox', 'checkbox');
                isempty_checkbox.setDefaultValue('T');
                isempty_checkbox.setDisplayType('hidden');


            }
            var numpay = form.addField('custpage_num_payments', 'select', 'Number Of Payments');
            numpay.setDefaultValue('1');
            numpay.addSelectOption('1', '1');
            numpay.addSelectOption('2', '2');
            numpay.addSelectOption('3', '3');
            numpay.addSelectOption('4', '4');
            numpay.addSelectOption('5', '5');
            numpay.addSelectOption('6', '6');
            numpay.addSelectOption('7', '7');
            numpay.addSelectOption('8', '8');
            numpay.addSelectOption('9', '9');
            numpay.addSelectOption('10', '10');
            numpay.addSelectOption('11', '11');
            numpay.addSelectOption('12', '12');



            //***********************************************SUBLIST********************************************************
            var sublist = form.addSubList('custpage_results_sublist', 'list', 'Open Invoices'); //list || inlineeditor
            sublist.addMarkAllButtons();
            sublist.addRefreshButton(); // can make use of this method to perform refresh of list
            form.setScript('customscript_cg_extract_to_excel');
            sublist.addButton('custpage_excel_button', 'extract to excel', 'fnExcelReport()');
            var search = nlapiLoadSearch(null, 'customsearch_credit_guard_interface');

            //add dynamic filter for loaded search
            if (request.getParameter('rectype') == 'customer') {
                var newFilter = new nlobjSearchFilter('internalid', 'customermain', 'anyof', request.getParameter('custid'));
                search.addFilter(newFilter);
            }
            else if (request.getParameter('rectype') == 'customtransaction_credit_card_advanced') {
                var newFilter = new nlobjSearchFilter('internalid', 'custbody_customer', 'anyof', request.getParameter('custid'));
                search.addFilter(newFilter);
            }



            nlapiLogExecution('debug', 'filterExpression', JSON.stringify(search.filterExpression));

            var results = search.runSearch().getResults(0, 500);

            //nlapiLogExecution('debug', 'internalId', ' internalId:' + internalId);

            // Create an array to store the transactions from the search results
            var transactionArray = new Array();
            if (results.length > 0) {
                //sublist.addField('custpage_internalid', 'text', 'Internal ID').setDisplayType('hidden');
                // Get the the search result columns
                var columns = results[0].getAllColumns();
                // sublist.addField('custpage_linestatus', 'text', 'Status').setDisplayType('disabled');
                sublist.addField('custpage_checkbox', 'checkbox', 'Make Payment');
                for (var k = 0; k < columns.length; k++) {
                    var name = columns[k].getName();
                    var type = columns[k].getType();
                    var label = columns[k].getLabel();
                    nlapiLogExecution('debug', 'name: ' + name, ' type: ' + type + ', label: ' + label);
                    if (type == 'datetime')
                        type = 'date';

                    if (label.toString().toUpperCase() == 'SERVICE AGREEMENT AMOUNT')
                        var field = sublist.addField('custpage_service_agr_amount', type, label).setDisplayType('disabled');
                    else if (type != 'select') {
                        var field = sublist.addField(name, type, label).setDisplayType('disabled');
                    }
                    else if (name == 'internalid') {
                        var selectlist = name;
                        /* if (label.toString().toUpperCase() == 'INTERNAL ID'){
                             name = 'internalid';
                         }*/
                        var field = sublist.addField(name, 'text', label).setDisplayType('hidden');
                    }
                }

                // For each search results row, create a transaction object and attach it to the transactionArray
                for (var j = 0; j < results.length; j++) {
                    var transaction = new Object();

                    // Copy the row values to the transaction object
                    for (var l = 0; l < columns.length; l++) {
                        var col = columns[l].getName();
                        var type = columns[l].getType();
                        //nlapiLogExecution('Debug', 'col', col + ' type ' + type);
                        if (col == "companyname")
                            continue;
                        if (type == "date" || type == "datetime") {
                            var datetime = results[j].getValue(col);
                            if (datetime != '' && datetime.indexOf(":") > 0)
                                datetime = datetime.substring(0, datetime.indexOf(":") - 2);
                            transaction[col] = datetime;
                        }
                        else
                            transaction[col] = results[j].getValue(col);
                    }
                    // Attach the transaction object to the transaction array
                    //nlapiLogExecution('Debug', 'new line', l +' + '+ transaction);
                    transactionArray[j] = transaction;
                }
            }
            nlapiLogExecution('Debug', 'transactionArray', JSON.stringify(transactionArray));
            // Initiate the sublist with the transactionArray
            nlapiLogExecution('Debug', 'set sublist', '');
            sublist.setLineItemValues(transactionArray);



            //**********************************************end SUBLIST************************************************************

            if (request.getParameter('custid') == null) {
                throw nlapiCreateError('Value Missing', 'This screen can be opened from the invoice record only', true);
            }

            var rectype = form.addField('custpage_rectype', 'text', 'Created From');
            rectype.setDefaultValue(request.getParameter('rectype'));
            rectype.setDisplayType('hidden');


            //if (transactionArray.length > 0)
            var totalamount = form.addField('custpage_totalamount', 'currency', 'Total Amount');
            form.addSubmitButton('Submit');
            response.writePage(form);
        }
        else {
            //****************************************************Second Charge*********************************************************
            nlapiLogExecution('DEBUG', 'card submit', 'card submit');

            var vcust = request.getParameter('custpage_customer');
            var vexpdate = request.getParameter('custpage_expdate');
            var vcvv = request.getParameter('custpage_cvv');
            var vnumpay = request.getParameter('custpage_num_payments');
            var vid = request.getParameter('custpage_id');
            var vtotalamount = request.getParameter('custpage_totalamount');
            var vstanding_order_checkbox = request.getParameter('custpage_standing_order');
            nlapiLogExecution('DEBUG', 'vstanding_order_checkbox ', vstanding_order_checkbox);

            var visempty_checkbox = request.getParameter('custpage_checkbox');
            nlapiLogExecution('DEBUG', 'visempty_checkbox ', visempty_checkbox);
            var vrectype = request.getParameter('custpage_rectype');

            globalSettings = getGlobalSettings(1);
            //**********************************************insert SUBLIST fields************************************************************

            var LinesNo = request.getLineItemCount('custpage_results_sublist');
            var SumOfAmount = 0;
            //var batchArr = '';
            var invoicesObj = {};
            var invoicesArr = [];
            //nlapiLogExecution('DEBUG', 'LinesNo ', LinesNo);
            for (var i = 1; i <= LinesNo; i++) {
                checkBox = request.getLineItemValue('custpage_results_sublist', 'custpage_checkbox', i);
                if (checkBox == 'T') {
                    var ammountcorrection = Number(request.getLineItemValue('custpage_results_sublist', 'custpage_amountcorrection', i));
                    if (ammountcorrection > 0)
                        SumOfAmount += ammountcorrection;
                    else
                        SumOfAmount += Number(request.getLineItemValue('custpage_results_sublist', 'formulanumeric', i));
                    //batchArr += request.getLineItemValue('custpage_results_sublist', 'custpage_resultssublist_serial', i) + ', ';
                    var invoicesJSON = {};
                    invoicesJSON.internalid = request.getLineItemValue('custpage_results_sublist', 'internalid', i);
                    invoicesJSON.docNum = request.getLineItemValue('custpage_results_sublist', 'tranid', i);
                    invoicesJSON.amount = Number(request.getLineItemValue('custpage_results_sublist', 'formulanumeric', i));
                    invoicesJSON.amountcorrection = ammountcorrection;
                    invoicesArr.push(invoicesJSON);
                }
                invoicesObj = { "vcust": vcust, 'invoices': invoicesArr };
            }
            if (LinesNo == -1)
                invoicesObj = { "vcust": vcust, 'invoices': [] };

            var CC_Advanced = false;
            if (isEmpty(vtotalamount) == false) {
                SumOfAmount = vtotalamount;
                CC_Advanced = true;

            }

            nlapiLogExecution('DEBUG', 'SumOfOnHand + invoicesArr ', SumOfAmount + ' + ' + JSON.stringify(invoicesObj));

            //**********************************************end of insert SUBLIST fields************************************************************
            nlapiLogExecution('DEBUG', 'Second Charge - vrectype ', vrectype);

            if (visempty_checkbox != 'T') {

                var vcardid = request.getParameter('custpage_cardid');

                nlapiLogExecution('DEBUG', 'vcust, SumOfAmount, vcardno, vexpdate, vcvv', vcust + ' + ' + SumOfAmount + ' + ' + vcardid + ' + ' + vexpdate + ' + ' + vcvv);

                var new_request = xml_request(vstanding_order_checkbox, vcust, SumOfAmount, vcardid, vnumpay, vid, vexpdate, vcvv);
                nlapiLogExecution('DEBUG', 'new_request ', new_request);

                var htmlfield = form.addField('custpage_html', 'inlinehtml', '', null, null);
                var htmlfieldcreation = form.addField('custpage_htmlfieldcreation', 'inlinehtml', '', null, null);

                if (new_request != 'עסקה תקינה') {
                    var html = "<script>showAlertBox('alert_No_relevant', 'Error', 'Error: " + new_request + " ', NLAlertDialog.TYPE_HIGH_PRIORITY); setTimeout('window.history.go(-2)', 1500);</script>";
                    htmlfield.setDefaultValue(html);
                }
                else {
                    var html = "<script>showAlertBox('alert_No_relevant', 'Confirmed', 'Payment Succeeded: " + new_request + "', NLAlertDialog.TYPE_LOWEST_PRIORITY); setTimeout('window.history.go(-2)', 1500);</script>";
                    htmlfield.setDefaultValue(html);
                    var creation = billCreation(CC_Advanced, SumOfAmount, invoicesObj, vnumpay);
                    nlapiLogExecution('DEBUG', 'creation response', creation);
                    if (creation != true) {
                        nlapiLogExecution('DEBUG', 'creation != true', '');
                        var htmlcreate = "<script>showAlertBox('alert_No_relevant', 'Error', 'Payment Succeeded - Internal Error: " + creation + " ', NLAlertDialog.TYPE_HIGH_PRIORITY); setTimeout('window.history.go(-2)', 1500);</script>";
                        htmlfieldcreation.setDefaultValue(htmlcreate);
                    }
                }

            }
            else {
                var vcardid = nlapiLookupField('customer', vcust, 'custentity_card_id');

                var new_request = xml_request(vstanding_order_checkbox, vcust, SumOfAmount, vcardid, vnumpay);
                nlapiLogExecution('DEBUG', 'else new_request ', new_request);

                var htmlfield = form.addField('custpage_html', 'inlinehtml', '', null, null);
                var htmlfieldcreation = form.addField('custpage_htmlfieldcreation', 'inlinehtml', '', null, null);

                if (new_request != 'עסקה תקינה') {
                    var html = "<script>showAlertBox('alert_No_relevant', 'Error', 'Error: " + new_request + " ', NLAlertDialog.TYPE_HIGH_PRIORITY); setTimeout('window.history.go(-2)', 1500);</script>";
                    htmlfield.setDefaultValue(html);
                }
                else {
                    var html = "<script>showAlertBox('alert_No_relevant', 'Confirmed', 'Payment Succeeded: " + new_request + " ', NLAlertDialog.TYPE_LOWEST_PRIORITY); setTimeout('window.history.go(-2)', 1500);</script>";
                    htmlfield.setDefaultValue(html);
                    var creation = billCreation(CC_Advanced, SumOfAmount, invoicesObj, vnumpay);
                    nlapiLogExecution('DEBUG', 'creation response', creation);
                    if (creation != true) {
                        nlapiLogExecution('DEBUG', 'creation != true', '');
                        var htmlcreate = "<script>showAlertBox('alert_No_relevant', 'Error', 'Payment Succeeded - Internal Error: " + creation + " ', NLAlertDialog.TYPE_HIGH_PRIORITY); setTimeout('window.history.go(-2)', 1500);</script>";
                        htmlfieldcreation.setDefaultValue(htmlcreate);
                    }
                }

            }
            response.writePage(form);
        }

    } catch (e) {
        nlapiLogExecution('DEBUG', 'Error', e);
    }

}
//*************************************************************functions********************************************************************************************************************************
function xml_request(standing_order, cust, total, cardId, numpay, id, expdate, cvv) {
    try {
        //nlapiLogExecution('DEBUG', 'xml_request function : ', 'xml_request');
        //var response =200;

        total = parseFloat((total * 100).toFixed(0));//parseFloat
        var rec = nlapiLoadRecord('customer', cust);

        if (isEmpty(expdate) == true)
            expdate = rec.getFieldValue('custentity_expiration_date');

        //var xml = '<?xml version="1.0"?>';
        var xml = '<?xml version="1.0" encoding="UTF-8"?>';
        xml += '<ashrait>';
        xml += '<request>';
        xml += '<version>2000</version>';
        xml += '<language>HEB</language>';
        var date = getdate();
        xml += '<dateTime>' + date + '</dateTime>';
        xml += '<command>doDeal</command>';
        xml += '<doDeal>';
        xml += '<terminalNumber>0886812013</terminalNumber>';//old - 0881818014 new -
        if (isEmpty(rec.getFieldValue('custentity_card_id')) == true)
            xml += '<cardNo>' + cardId + '</cardNo>';
        else
            xml += '<cardId>' + cardId + '</cardId>';

        nlapiLogExecution('DEBUG', 'expdate : ', expdate);

        //xml += '<cardExpiration>' + expdate + '</cardExpiration>';

        if (isEmpty(expdate) == false)
            xml += '<cardExpiration>' + expdate + '</cardExpiration>';
        else {
            xml += '<cardExpiration>' + '' + '</cardExpiration>';
        }

        if (isEmpty(cvv) == false)
            xml += '<cvv>' + cvv + '</cvv>';
        else {
            xml += '<cvv>' + 0 + '</cvv>';//merchant chooses not to pass CVV
        }

        if (isEmpty(id) == false)
            xml += '<id>' + id + '</id>';
        xml += '<total>' + total + '</total>';
        xml += '<transactionType>Debit</transactionType>';
        if (numpay > 1) {
            xml += '<creditType>Payments</creditType>';

            var firstPayment = parseFloat(((total / numpay)).toFixed(0));
            var numberofpayments = parseFloat(numpay - 1);
            var periodicalPayments = ((total / numpay)).toFixed(0);

            nlapiLogExecution('DEBUG', 'total = firstPayment + (number of payments x periodical payments) : ', total + ' = ' + firstPayment + ' + ' + '( ' + numberofpayments + ' x ' + periodicalPayments + ' )');
            var paymentstotal = parseFloat(firstPayment) + (numberofpayments * parseFloat(periodicalPayments));
            nlapiLogExecution('DEBUG', 'paymentstotal : ', paymentstotal);
            var gap = (total - paymentstotal);
            nlapiLogExecution('DEBUG', 'gap : ', gap);



            var finalfirstPayment = firstPayment + gap;
            nlapiLogExecution('DEBUG', 'finalfirstPayment : ', finalfirstPayment);


            xml += '<firstPayment>' + finalfirstPayment + '</firstPayment>';
            xml += '<periodicalPayment>' + periodicalPayments + '</periodicalPayment>';
            xml += '<numberOfPayments>' + numberofpayments + '</numberOfPayments>';
            //total = firstPayment + (number of payments x periodical payments)


        }
        else
            xml += '<creditType>RegularCredit</creditType>';

        xml += '<currency>ILS</currency>';
        xml += '<transactionCode>Phone</transactionCode>';

        nlapiLogExecution('debug', 'standing_order', standing_order);
        nlapiLogExecution('debug', 'isEmpty(standing_order)', isEmpty(standing_order));

        if (isEmpty(standing_order))
            xml += '<validation>AutoComm</validation>';
        else if (standing_order == 'F')
            xml += '<validation>Verify</validation>';// בדיקת אשראי
        else if (standing_order == 'T')
            xml += '<validation>Token</validation>';// הצפנה

        xml += '</doDeal>';
        xml += '</request>';
        xml += '</ashrait>';

        //nlapiLogExecution('DEBUG', 'xml', xml);


        //xml = nlapiStringToXML(xml);

        var headers = {
            'Content-Type': "application/x-www-form-urlencoded"
        };

        var environment = context.getEnvironment();
        nlapiLogExecution('DEBUG', 'environment', environment);

        if (environment == 'SANDBOX') {
            var sUrl = globalSettings[0].sandbox_url//'https://cguat2.creditguard.co.il/xpo/Relay';

            var xmltosend = {
                'user': globalSettings[0].sandbox_user_name,
                'password': globalSettings[0].sandbox_password,
                'int_in': xml
            }
        }
        else {
            var sUrl = globalSettings[0].prod_url // 'https://cguat2.creditguard.co.il/xpo/Relay';

            var xmltosend = {
                'user': globalSettings[0].prod_user_name,
                'password': globalSettings[0].prod_password,
                'int_in': xml
            }
        }

        var response = nlapiRequestURL(sUrl, xmltosend, headers);
        nlapiLogExecution('DEBUG', 'response', JSON.stringify(response));
        nlapiLogExecution('DEBUG', 'response.body', JSON.stringify(response.body));

        var mestr = 'userMessage';
        var usermessage = response.body.slice(response.body.indexOf(mestr) + mestr.length + 1, response.body.lastIndexOf(mestr) - 2);
        nlapiLogExecution('DEBUG', 'usermessage', usermessage);

        var xmlDataResponse = nlapiStringToXML(response.body);
        //nlapiLogExecution('DEBUG', 'xmlDataResponse', xmlDataResponse);
        var cardID = nlapiSelectValue(xmlDataResponse, '//cardId');
        nlapiLogExecution('DEBUG', 'cardID', cardID);
        var message = nlapiSelectValue(xmlDataResponse, '//message');
        nlapiLogExecution('DEBUG', 'message', message);
        var status = nlapiSelectValue(xmlDataResponse, '//status');
        nlapiLogExecution('DEBUG', 'status', status);
        var cardNum = nlapiSelectValue(xmlDataResponse, '//cardNo');
        nlapiLogExecution('DEBUG', 'cardNum', cardNum);
        //var cardName = nlapiSelectValue(xmlDataResponse, '//cardName');
        cardName = getVal(response.body, '<cardName>', '</cardName>')
        nlapiLogExecution('DEBUG', 'cardName', cardName);

   
        if (!isEmpty(standing_order) && isEmpty(rec.getFieldValue('custentity_card_id')) && status == '000') {
            rec.setFieldValue('custentity_card_id', cardID);
            rec.setFieldValue('custentity_expiration_date', expdate);
            rec.setFieldValue('custentity_credit_card_number', cardNum);
            rec.setFieldValue('custentity_credit_card_type', cardName);
            rec.setFieldValue('custentity_recurring_agr_collection_mtd', GLOBAL_METHOD);//Credit Guard
            nlapiSubmitRecord(rec, true, true);
        }
        return usermessage;
    } catch (e) {
        return e.message;
    }
}
function isEmpty(val) {
    return (val == undefined || val == null || val == '');
}
function getdate() {
    var d = new Date();
    d.setHours(d.getHours() + 9)
    var month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();


    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;
    var formatdate = [year, month, day].join('-') + ' ' + d.toTimeString().substring(0, 8)
    return formatdate;
}
function billCreation(CC_Advanced, SumOfAmount, invoicesObj, numofpaym) {

    try {

        nlapiLogExecution('DEBUG', ' inside function invoicesObj', 'CC_Advanced: ' + CC_Advanced + ' + SumOfAmount: ' + SumOfAmount + ' + numofpaym: ' + numofpaym + ' + InvoicesObj: ' + JSON.stringify(invoicesObj));

        var rec = nlapiCreateRecord('customerpayment', { recordmode: 'dynamic' });
        rec.setFieldValue('custbody_number_of_payments', numofpaym);
       

        for (var fld in invoicesObj) {
            var val = invoicesObj[fld];
            if (fld == 'vcust') {
                rec.setFieldValue('customer', val);
                var linecount = rec.getLineItemCount('apply');
                nlapiLogExecution('DEBUG', 'linecount', linecount);
                rec.setFieldValue('undepfunds', 'F');
                rec.setFieldValue('account', globalSettings[0].acc_customer_button);
            }
            if (fld == 'invoices' && CC_Advanced == false) {
                var invoices = val;
                for (var i = 0; i < invoices.length; i++) {
                    var invoice = invoices[i];
                    for (var fldinv in invoice) {
                        var valinv = invoice[fldinv];
                        nlapiLogExecution('DEBUG', 'invoice fldinv and valinv: ' + i, fldinv + ' + ' + valinv);
                        if (fldinv == 'docNum') {
                            for (var k = 1; k < linecount + 1; k++) {
                                var refnum = rec.getLineItemValue('apply', 'refnum', k);
                                nlapiLogExecution('DEBUG', 'rec refnum and invoice valinv: ' + k, refnum + ' + ' + valinv);
                                if (refnum == valinv) {
                                    nlapiLogExecution('DEBUG', 'IN: ', 'IF');
                                    rec.selectLineItem('apply', k);
                                    rec.setCurrentLineItemValue("apply", "apply", 'T');
                                    nlapiLogExecution('DEBUG', 'isEmpty(fldinv[amountcorrection]): ', isEmpty(invoice['amountcorrection']));
                                    if (isEmpty(invoice['amountcorrection']) == false)
                                        rec.setCurrentLineItemValue("apply", "disc", invoice['amountcorrection']);
                                    rec.commitLineItem("apply");


                                    continue;

                                }

                            }
                        }
                    }
                }
            }
            else if (CC_Advanced == true) {
                nlapiLogExecution('DEBUG', 'invoicesObj.length ', invoicesObj.length);
                if (invoicesObj.length != 0)
                    rec.setFieldValue('autoapply', 'T');
                rec.setFieldValue('payment', SumOfAmount);

            }
        }
        rec.setFieldValue('paymentoption', globalSettings[0].payment_option);//Credit Guard
        var recid = nlapiSubmitRecord(rec, true, true);
        nlapiLogExecution('DEBUG', 'billCreation recid', recid);
        return true;
    } catch (e) {
        nlapiLogExecution('DEBUG', ' Error - billCreation ', e);
        return e;
    }
}
function getGlobalSettings(method) {

    var columns = new Array();
    columns.push(new nlobjSearchColumn('custrecord_bank_acc_cg_batch_screen'));
    columns.push(new nlobjSearchColumn('custrecord_bank_acc_cg_customer_button'));
    columns.push(new nlobjSearchColumn('custrecord_code_mosad'));
    columns.push(new nlobjSearchColumn('custrecord_mosad_sender'));
    columns.push(new nlobjSearchColumn('custrecord_prod_user_name'));
    columns.push(new nlobjSearchColumn('custrecord_prod_password'));
    columns.push(new nlobjSearchColumn('custrecord_sandbox_user_name'));
    columns.push(new nlobjSearchColumn('custrecord_sandbox_password'));
    columns.push(new nlobjSearchColumn('custrecord_prod_url'));
    columns.push(new nlobjSearchColumn('custrecord_sandbox_url'));
    columns.push(new nlobjSearchColumn('custrecord_subsidiary'));
    columns.push(new nlobjSearchColumn('custrecord_payment_option'));
    

    var filters = new Array();
    filters[0] = new nlobjSearchFilter('custrecord_recurring_agr_collection_mtd', null, 'anyof', method)

    var search = nlapiCreateSearch('customrecord_collection_settings', filters, columns);

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
                acc_batch_screen: s[i].getValue('custrecord_bank_acc_cg_batch_screen'),
                acc_customer_button: s[i].getValue('custrecord_bank_acc_cg_customer_button'),
                code_mosad: s[i].getValue('custrecord_code_mosad'),
                mosad_sender: s[i].getValue('custrecord_mosad_sender'),
                prod_user_name: s[i].getValue('custrecord_prod_user_name'),
                prod_password: s[i].getValue('custrecord_prod_password'),
                sandbox_user_name: s[i].getValue('custrecord_sandbox_user_name'),
                sandbox_password: s[i].getValue('custrecord_sandbox_password'),
                prod_url: s[i].getValue('custrecord_prod_url'),
                sandbox_url: s[i].getValue('custrecord_sandbox_url'),
                subsidiary: s[i].getValue('custrecord_subsidiary'),
                payment_option: s[i].getValue('custrecord_payment_option'),
            });
        }
        nlapiLogExecution('DEBUG', 'getGlobalSettings results', JSON.stringify(results));
        return results;
    }
}
function getVal(str, startIndex, endIndex) {

    return str.substring(str.indexOf(startIndex)+10, str.indexOf(endIndex))

}

