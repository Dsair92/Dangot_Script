var context = nlapiGetContext();
var employeeId = context.user;
var errArr = new Array();
var sList = new Array();
var agrType;
var invoice_date = '';
var memo;
function CreateInvoice() {
    try { 
        var manage_inv_log = context.getSetting('SCRIPT', 'custscript_manage_inv_log');    
        manage_inv_log = JSON.parse(manage_inv_log);
        agrType = manage_inv_log[0].type
        memo = manage_inv_log[0].memo
        nlapiLogExecution('DEBUG', 'agrType :' + agrType, 'manage_inv_log: ' + JSON.stringify(manage_inv_log));
        var bpList = getBP(agrType, manage_inv_log[0].fromdate, manage_inv_log[0].todate, manage_inv_log[0].agr, manage_inv_log[0].ib, manage_inv_log[0].employee, manage_inv_log[0].customer, manage_inv_log[0].sub_type)
        nlapiLogExecution('DEBUG', 'bpList : ' + bpList.length, JSON.stringify(bpList));
        if (bpList.length > 0) {
            invoice_date = manage_inv_log[0].invoice_date
            SortDataPerSplit(bpList)
        }
        summaryEmail(employeeId);
    } catch (e) {
        nlapiLogExecution('error', 'error CreateInvoice ', e);
    }
}
//Billing Plan to INV
function getBP(type_data, from_date_data, to_date_data, agr_data, ib_data, employee_line_data, customer_data, sub_type) {
    try {
        var search = nlapiLoadSearch(null, 'customsearch_bp_to_inv');
        var cols = search.getColumns();
        search.addFilter(new nlobjSearchFilter('custrecord_agr_type', 'custrecord_bp_agr', 'anyof', type_data))
        if (!isNullOrEmpty(from_date_data)) { search.addFilter(new nlobjSearchFilter('custrecord_bp_date_for_inv', null, 'onorafter', from_date_data)) }
        search.addFilter(new nlobjSearchFilter('custrecord_bp_date_for_inv', null, 'onorbefore', to_date_data))
        if (!isNullOrEmpty(agr_data)) { search.addFilter(new nlobjSearchFilter('custrecord_bp_agr', null, 'anyof', agr_data)) }
        if (!isNullOrEmpty(ib_data)) { search.addFilter(new nlobjSearchFilter('custrecord_bp_ib', null, 'anyof', ib_data)) }
        if (!isNullOrEmpty(employee_line_data)) { search.addFilter(new nlobjSearchFilter('owner', 'custrecord_bp_agr', 'anyof', employee_line_data)) }
        if (!isNullOrEmpty(customer_data)) { search.addFilter(new nlobjSearchFilter('custrecord_bp_customer', null, 'anyof', customer_data)) }
        if (!isNullOrEmpty(sub_type)) { search.addFilter(new nlobjSearchFilter('custrecord_agr_sub_type', 'custrecord_bp_agr', 'anyof', sub_type)) }
        var bpList = [];
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
                bpList.push({
                    split_formula: s[i].getValue(cols[0]),
                    bp_id: s[i].id,
                    item: s[i].getValue(cols[1])
                });
            }
        }
        return bpList;
    } catch (e) {
        nlapiLogExecution('error', 'error getBP ', e);
    }
}
function SortDataPerSplit(bpList) {
    try {
        var data = []; 
        line = 0;
        split = bpList[0].split_formula;
        for (var m = line; m < bpList.length; m++) {                 
            if (split == bpList[m].split_formula) {
                data.push({
                    bp_id: bpList[m].bp_id,
                    item: bpList[m].item,
                });
            } else {
                CreateInvoiceFromBP(data)
                split = bpList[m].split_formula;   
                var data = []; 
                data.push({
                    bp_id: bpList[m].bp_id,
                    item: bpList[m].item,
                });
            }           
        }
        CreateInvoiceFromBP(data);
    } catch (e) {
        nlapiLogExecution('ERROR', 'CreateSingalInvoice Error:', e);
    }
}
function CreateInvoiceFromBP(dataToInvoice) {
    try {
        Context(context);
        nlapiLogExecution('DEBUG', 'CreateInvoiceFromBI dataToInvoice:' + dataToInvoice.length, JSON.stringify(dataToInvoice));
        for (var r = 0; r < dataToInvoice.length; r++) {
            //Context(context);
            var rec = nlapiLoadRecord('customrecord_bp', dataToInvoice[r].bp_id);
            if (r == 0) {
                var INVOICErec = nlapiCreateRecord('invoice');
                INVOICErec.setFieldValue('entity', rec.getFieldValue('custrecord_bp_customer'));                              
                INVOICErec.setFieldValue('custbody_agreement', rec.getFieldValue('custrecord_bp_agr'));  
                //INVOICErec.setFieldValue('location', 101)
                INVOICErec.setFieldValue('trandate', invoice_date)
                INVOICErec.setFieldValue('memo', memo)
            }
            try {   
                var item = dataToInvoice[r].item
                CreateItem(INVOICErec, rec , item)    
            } catch (err) {
                nlapiLogExecution('DEBUG', 'error CreateInvoiceFromBP - lines', err);
            }
        }
        try {
            var INVOICEid =  nlapiSubmitRecord(INVOICErec, null, true);
            nlapiLogExecution('debug', 'INVOICE id: ', INVOICEid);
            if (INVOICEid != -1) { 
                var tranid = nlapiLookupField('invoice', INVOICEid, 'tranid')
                afterSubmitSS(INVOICEid, tranid)
                sList.push({
                    agr: nlapiLookupField('customrecord_agr', rec.getFieldValue('custrecord_bp_agr'), 'name'),
                    agr_id: rec.getFieldValue('custrecord_bp_agr'),
                    invoice: tranid,  
                    invoice_id: INVOICEid
                });
            }
        } catch (e) {
            nlapiLogExecution('DEBUG', 'error nlapiSubmitRecord ', e);
            errArr.push({
                error: e,
                agr: nlapiLookupField('customrecord_agr', rec.getFieldValue('custrecord_bp_agr'), 'name'),
                agr_id: rec.getFieldValue('custrecord_bp_agr'),
            });          
        }
    } catch (e) {
        nlapiLogExecution('DEBUG', 'error CreateInvoiceFromBP ', e);
        nlapiSendEmail(employeeId, employeeId, 'Invoice create summary', 'An error occurred while trying to create Invoices \n Error description: ' + e);
    }
}
function CreateItem(INVOICErec, rec, item) {
    try {
        Context(context);     
        var qty = 1;
        if (agrType == 2) { // חיוב מתחדש
            qty = rec.getFieldValue('custrecord_bp_quantity');
        }
        if (isNullOrEmpty(qty)) { qty = 1;}            
        INVOICErec.selectNewLineItem('item');
        INVOICErec.setCurrentLineItemValue('item', 'item', item);
        INVOICErec.setCurrentLineItemValue('item', 'quantity', qty)
        INVOICErec.setCurrentLineItemValue('item', 'rate', rec.getFieldValue('custrecord_bp_rate'))

        addLineFields(INVOICErec, rec) 
        
    } catch (e) {
        nlapiLogExecution('ERROR', 'CreateItem Error:', e);
    }
}
function isNullOrEmpty(val) {

    if (typeof (val) == 'undefined' || val == null || (typeof (val) == 'string' && val.length == 0)) {
        return true;
    }
    return false;
}
function Context(context) {
    if (context.getRemainingUsage() < 5000) {
        nlapiLogExecution('DEBUG', 'Context', context.getRemainingUsage());
        var state = nlapiYieldScript();
        if (state.status == 'FAILURE') {
            nlapiLogExecution('ERROR', 'Error', ' Failed to yeild script');
        }
        else if (state.status == 'RESUME') {
            nlapiLogExecution("AUDIT", 'run', "Resuming script due to: " + state.reason + ",  " + state.size);
        }
    }
}
function addLineFields(INVOICErec, rec) {
    try {
        var ibId = rec.getFieldValue('custrecord_bp_ib');       
        var ibRec = nlapiLoadRecord('customrecord_ib', ibId);
        INVOICErec.setCurrentLineItemValue('item', 'custcol_bs_agr', rec.getFieldValue('custrecord_bp_agr'))
        INVOICErec.setCurrentLineItemValue('item', 'custcol_bs_bp', rec.getId())
        INVOICErec.setCurrentLineItemValue('item', 'custcol_bs_ib', ibId )
        INVOICErec.setCurrentLineItemValue('item', 'custcol_service_start_date', rec.getFieldValue('custrecord_bp_service_start_date'))
        INVOICErec.setCurrentLineItemValue('item', 'custcol_service_end_date', rec.getFieldValue('custrecord_bp_service_end_date'))
        INVOICErec.setCurrentLineItemValue('item', 'custcol_bs_billing_cycle', ibRec.getFieldValue('custrecord_ib_billing_cycle'))
        INVOICErec.setCurrentLineItemValue('item', 'custcol_dangot_recurring_charge_type', ibRec.getFieldValue('custrecord_ib_charge_type'))
        INVOICErec.setCurrentLineItemValue('item', 'custcol_serial_number', ibRec.getFieldValue('custrecord_ib_serial_number'))
        INVOICErec.setCurrentLineItemValue('item', 'description', ibRec.getFieldValue('custrecord_ib_description'))
        INVOICErec.commitLineItem('item'); 
            
    } catch (e) {
        nlapiLogExecution('ERROR', 'addFieldToLine Error:', e);
    }
    
}
function summaryEmail(employeeId) {
    nlapiLogExecution('DEBUG', 'inside send mail', 'inside send mail');
    try {
        var date = new Date();
        var subject = "Invoices create summary ";
        var body = '<html>' +
            '<head>' +
            '<style>' +
            'table, th, td {' +
            'border: 2px solid black;' +
            'border-collapse: collapse;' +
            '}' +
            'td {' +
            'padding: 5px;' +
            'text-align: left;' +
            '}' +
            'th {' +
            'padding: 5px;' +
            'text-align: center;' +
            'background-color: #edeaea;' +
            'font-weight: bold ;' +
            '}' +
            '</style>' +
            '</head>' +
            "<div><p style= \'font-weight: bold ;font-size:110%; \'> Time stamp : " + date + "</p><br><br>" +
            "<p style='color:black; font-size:100%;'>The process of Invoices create has been completed. </p> " +
            "<p style='color: black; font-size:100%;'>Here is a summary of the results:</p></div>";

        var successTbl = '<p style= \'font-weight: bold ;color: green; font-size:140%; \'>Total: ' + sList.length + ' succeeded</p><br>';
        if (sList != null && sList != '') {
            successTbl += "<table style = \"width: 100 %;\" >";
            // for th
            successTbl += "<tr><th>Agreement</th><th>Invoice</th></tr>";
            for (var v in sList) {
                successTbl += "<tr><td>" + GetLink(sList[v].agr, sList[v].agr_id, 'customrecord_agr')  + "</td>";
                successTbl += "<td>" + GetLink(sList[v].invoice, sList[v].invoice_id, 'invoice') + "</td>"
                successTbl += "</tr>";
            }
            successTbl += "</table>"
        }

        var failTbl = '<p style= \'font-weight: bold ;color: red; font-size:140%; \'> Total: ' + errArr.length + ' failed</p><br>';
        if (errArr != null && errArr != '') {
            failTbl += "<table style = \"width: 100 %;\" >";
            // for th
            failTbl += "<tr><th>Agreement</th><th>Error</th></tr>";
            for (var s in errArr) {
                failTbl += "<tr><td>" + GetLink(errArr[s].agr, errArr[s].agr_id, 'customrecord_agr') + "</td><td>" + errArr[s].error + "</td></tr > ";
            }
            failTbl += "</table>"
        }
        var list = successTbl + '<br>' + failTbl;
        body += list;
        body += '<br></html>';
        nlapiSendEmail(employeeId, employeeId, subject, body);
        nlapiLogExecution('debug', 'after email', 'email has been sent');
    } catch (e) {
        nlapiLogExecution('error', 'email()', e);
    }
}
function GetLink(name,id, type) {
    var link = "<a href='https://system.netsuite.com" + nlapiResolveURL('RECORD', type, id) + "'" + ' target="_blank">' + name + "</a>";
    return link;
}
function afterSubmitSS(recId, tranid) {
    try {
        var HEADER = buildExcelHeader(tranid)
        var FOOTER = buildExcelFooter()
        var LINES = '';
        var invRec = nlapiLoadRecord('invoice', recId)
        var count = invRec.getLineItemCount('item');
        for (var i = 1; i <= count; i++) {
            Context(context);
            var item = invRec.getLineItemText('item', 'item', i);
            var description = invRec.getLineItemValue('item', 'description', i);
            var quantity = invRec.getLineItemValue('item', 'quantity', i);
            var rate = invRec.getLineItemValue('item', 'rate', i);
            LINES += buildExcelLines(item, description, quantity, rate);
            var bs_bp = invRec.getLineItemValue('item', 'custcol_bs_bp', i);
            if (!isNullOrEmpty(bs_bp)) {
                nlapiSubmitField('customrecord_bp', bs_bp, 'custrecord_bp_invoice_on', recId);
            }
        }
        var xmlStr = HEADER + LINES + FOOTER
        createCSV(xmlStr, recId, tranid) 
    } catch (e) {
        nlapiLogExecution('ERROR', 'error afterSubmitSS', e);
    }
}

function buildExcelHeader(tranid) {

    var xmlStr = '<?xml version="1.0" encoding="utf-8"?><?mso-application progid="Excel.Sheet"?>';
    xmlStr += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
    xmlStr += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
    xmlStr += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
    xmlStr += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
    xmlStr += 'xmlns:html="http://www.w3.org/TR/REC-html40">';
    xmlStr += '<Styles>';
    xmlStr += '<Style ss:ID="company">';
    xmlStr += '<Alignment ss:Horizontal="Center"/>';
    xmlStr += '<Font ss:Bold="1"/>';
    xmlStr += '</Style> <Style ss:ID="error">';
    xmlStr += '<Alignment ss:Horizontal="Center"/>';
    xmlStr += '<Interior ss:Color="#007ACC" ss:Pattern="Solid" />';
    xmlStr += '<Font ss:Bold="1"/>';
    xmlStr += '</Style> <Style ss:ID="header">';
    xmlStr += '<Alignment ss:Horizontal="Center" />';
    xmlStr += '<Font ss:Size="8"  ss:Color="#fefefe"  ss:Bold="0"/>';
    xmlStr += '<Interior ss:Color="#007ACC" ss:Pattern="Solid"/>';
    xmlStr += '</Style> <Style ss:ID="maintitle">';
    xmlStr += '<Alignment ss:Horizontal="Center"/>';
    xmlStr += '<Font ss:Size="14" ss:Bold="1"/>';
    xmlStr += '<Interior ss:Pattern="Solid"/>';
    xmlStr += '</Style> <Style ss:ID="Default" ss:Name="Normal">';
    xmlStr += '<Alignment ss:Vertical="Bottom" ss:Horizontal="Center"/>';
    xmlStr += '<Borders/>';
    xmlStr += '    <Font ss:FontName="Arial" ss:Size="8"/>';
    xmlStr += '<Interior/>';
    xmlStr += '   <NumberFormat ss:Format="&quot;ILS&quot;#,##0.00_);(&quot;ILS&quot;#,##0.00)"/>';
    xmlStr += '<Protection/>';
    xmlStr += '</Style>';
    xmlStr += '<Style ss:ID="s__TIMEOF DAY"><NumberFormat ss:Format="Medium Time"/></Style>';
    xmlStr += '<Style ss:ID="s__DATETIME"><NumberFormat ss:Format="General Date"/></Style>';
    xmlStr += '<Style ss:ID="s__DATETIMETZ"><NumberFormat ss:Format="General Date"/></Style>';
    xmlStr += '<Style ss:ID="s__DATE"><NumberFormat ss:Format="Short Date"/>';
    xmlStr += '</Style><Style ss:ID="s__text"></Style><Style ss:ID="s__currency"><NumberFormat ss:Format="Currency"/></Style>';
    xmlStr += '<Style ss:ID="s__percent"><NumberFormat ss:Format="Percent"/></Style>';
    xmlStr += '<Style ss:ID="s1_b_text"><Alignment ss:Indent="1"/><Font ss:FontName="Verdana" x:Family="Swiss" ss:Size="8" ss:Color="#000000" ss:Bold="1"/></Style>';
    xmlStr += '<Style ss:ID="s_b_text"><Font ss:FontName="Verdana" x:Family="Swiss" ss:Size="8" ss:Color="#000000" ss:Bold="1"/></Style>';
    xmlStr += '<Style ss:ID="s2__text"><Alignment ss:Indent="2"/></Style>';
    xmlStr += '<Style ss:ID="s_b_currency"><Font ss:FontName="Verdana" x:Family="Swiss" ss:Size="8" ss:Color="#000000" ss:Bold="1"/><NumberFormat ss:Format="Currency"/></Style>';
    xmlStr += '<Style ss:ID="s_currency_nosymbol"><Font ss:FontName="Verdana" x:Family="Swiss" ss:Size="8" ss:Color="#000000" /><NumberFormat ss:Format="#,##0.00_);[Red]\(#,##0.00\)"/></Style>';
    xmlStr += '<Style ss:ID="s1__text"><Alignment ss:Indent="1"/></Style>';
    xmlStr += '<Style ss:ID="s_b_currency_X"><Font ss:FontName="Verdana" x:Family="Swiss" ss:Size="8" ss:Color="#000000" ss:Bold="1"/><Interior ss:Color="#f0e0e0" ss:Pattern="Solid"/><NumberFormat ss:Format="Currency"/></Style>';
    xmlStr += '<Style ss:ID="s__currency_he_IL"><Alignment ss:Vertical="Center" ss:Horizontal="Right"/><NumberFormat ss:Format="&quot;ILS&quot;#,##0.00_);(&quot;ILS&quot;#,##0.00)"/></Style>';
    xmlStr += '<Style ss:ID="s__currency_en_US"><Alignment ss:Vertical="Center" ss:Horizontal="Right"/><NumberFormat ss:Format="&quot;$&quot;#,##0.00_);(&quot;$&quot;#,##0.00)"/></Style>';
    xmlStr += '<Style ss:ID="s__currency_en_CA"><Alignment ss:Vertical="Center" ss:Horizontal="Right"/><NumberFormat ss:Format="&quot;Can$&quot;#,##0.00_);(&quot;Can$&quot;#,##0.00)"/></Style>';
    xmlStr += '<Style ss:ID="s__currency_fr_FR_EURO"><Alignment ss:Vertical="Center" ss:Horizontal="Right"/><NumberFormat ss:Format="&quot;€&quot;#,##0.00_);(&quot;€&quot;#,##0.00)"/></Style>';
    xmlStr += '<Style ss:ID="s__currency_en_GB"><Alignment ss:Vertical="Center" ss:Horizontal="Right"/><NumberFormat ss:Format="&quot;£&quot;#,##0.00_);(&quot;£&quot;#,##0.00)"/></Style>';
    xmlStr += '<Style ss:ID="s__currency_ko_KR"><Alignment ss:Vertical="Center" ss:Horizontal="Right"/><NumberFormat ss:Format="&quot;KRW&quot;#,##0.00_);(&quot;KRW&quot;#,##0.00)"/></Style>';
    xmlStr += '<Style ss:ID="s__currency_zh_CN"><Alignment ss:Vertical="Center" ss:Horizontal="Right"/><NumberFormat ss:Format="&quot;Y&quot;#,##0.00_);(&quot;Y&quot;#,##0.00)"/></Style>';
    xmlStr += '<Style ss:ID="s__currency_en_NZ"><Alignment ss:Vertical="Center" ss:Horizontal="Right"/><NumberFormat ss:Format="&quot;$NZ&quot;#,##0.00_);(&quot;$NZ&quot;#,##0.00)"/></Style>';
    xmlStr += '</Styles>';

    xmlStr += '<Worksheet ss:Name="lines">';

    var header = '<Row><Cell ss:StyleID="maintitle" ss:MergeAcross="8"><Data ss:Type="String">פירוט חשבונית מספר ' + tranid + '</Data></Cell></Row>';  
    xmlStr += '<Table>' +
        '<ss:Column ss:AutoFitWidth="1" ss:Width="110"/>' +
        '<ss:Column ss:AutoFitWidth="1" ss:Width="110"/>' +
        '<ss:Column ss:AutoFitWidth="1" ss:Width="110"/>' +
        '<ss:Column ss:AutoFitWidth="1" ss:Width="110"/>' +
        '<ss:Column ss:AutoFitWidth="1" ss:Width="110"/>' +
        '<ss:Column ss:AutoFitWidth="1" ss:Width="110"/>' +
        '<ss:Column ss:AutoFitWidth="1" ss:Width="110"/>' +
        '<ss:Column ss:AutoFitWidth="1" ss:Width="110"/>' +
        '<ss:Column ss:AutoFitWidth="1" ss:Width="110"/>' +
        header +
        '<Row>' +
        '<Cell ss:StyleID="header" ><Data ss:Type="String">Item</Data></Cell>' +
        '<Cell ss:StyleID="header"><Data ss:Type="String">Description</Data></Cell>' +
        '<Cell ss:StyleID="header"><Data ss:Type="String">Qty</Data></Cell>' +
        '<Cell ss:StyleID="header"><Data ss:Type="String">Rate</Data></Cell>' +
        '</Row>';

    return xmlStr
}
function buildExcelLines(item, description, quantity,rate ) {  
        xmlStr = '<Row>' +
            '<Cell ss:StyleID="Default"><Data ss:Type="String">' + item + '</Data></Cell>' +
            '<Cell ss:StyleID="Default"><Data ss:Type="String">' + description + '</Data></Cell>' +
            '<Cell ss:StyleID="Default"><Data ss:Type="String">' + quantity + '</Data></Cell>' +
            '<Cell ss:StyleID="Default"><Data ss:Type="String">' + rate + '</Data></Cell>' +
        '</Row>';
    return xmlStr   
}
function buildExcelFooter() {
    return '</Table></Worksheet></Workbook>';
}
function createCSV(xmlStr, recId, tranid) {
    var file = nlapiCreateFile(tranid + " Lines.xls", 'EXCEL', nlapiEncrypt(xmlStr, 'base64'));
    file.setFolder(-15);
    var FileID = nlapiSubmitFile(file);
    nlapiAttachRecord("file", FileID, 'invoice', recId);
}



