    /**
     * @NAPIVersion 2.1
     * @NscriptType UserEventScript
     * @NmoduleScope SameAccount
     * 
     */

    define(['N/record', 'N/error', 'N/query', 'N/format','N/task','N/currency', 'N/log'],
        function (record, error, query, format, task,currency,log) {
            var exports = {}
            function beforeload(context) {
                var Record = context.newRecord;
                var Created_From  = Record.getValue('createdfrom');
                var Lines = Record.getLineCount('item');
                if (!isNullOrEmpty(Created_From) && Lines > 0 && context.type == 'create'){
                    var Lines = Record.getLineCount('item');
                    var Currency = Record.getValue('currency');
                    var Date = Record.getValue('trandate');
                    var High_Rate_USD = Record.getValue('custbody_h_usd_rate');
                    log.debug({
                        title: 'Header Validation',
                        details: JSON.stringify({
                            Created_From : Created_From,
                            Lines : Lines,
                            Tran_currency : Currency,
                            Date : Date, 
                            High_Rate_USD : High_Rate_USD
                        })
                    })
                    for (var i = 0; i < Lines; i++){
                        var Item_Currency = Record.getSublistValue({  sublistId: 'item',fieldId: 'custcol_item_currency',line: i});
                        var Item_Price = Record.getSublistValue({sublistId: 'item',fieldId: 'custcol_original_price',line : i});
                        var Item_Qty = Record.getSublistValue({sublistId: 'item',fieldId: 'quantity',line : i});
                        if (Currency != Item_Currency && !isNullOrEmpty(Item_Currency)){
                            if (Currency == 5 && Item_Currency == 1 && High_Rate_USD == true ){
                                var Conversion_Rate = HRDollar(formatDate(Date))
                            }else{
                                var Conversion_Rate = currency.exchangeRate({source: Item_Currency, target: Currency ,date:Date})
                            }
                            var New_Rate = Conversion_Rate * Item_Price
                            Record.setSublistValue({sublistId:'item',fieldId: 'price',line: i , value: -1})    
                            Record.setSublistValue({sublistId:'item',fieldId: 'rate',line: i , value: New_Rate.toFixed(2)})
                            Record.setSublistValue({sublistId:'item',fieldId: 'amount',line: i , value: New_Rate * Item_Qty })
                        }
                        log.debug({
                            title: 'Line Validation',
                            details: JSON.stringify({
                                Line : i,
                                Item_Currency : Item_Currency,
                                Item_Price : Item_Price,
                                Item_Qty : Item_Qty,
                                Conversion_Rate : Conversion_Rate,
                                New_Rate : New_Rate    
                            })
                        })
                    }
                }
                
            }
            function isNullOrEmpty(val) {
                if (typeof (val) == 'undefined' || val == null || (typeof (val) == 'string' && val.length == 0)) {
                    return true;
                }
                return false;
            }
            function HRDollar(date) {
                var Rate_QL = query.runSuiteQL({
                        query : `select 
                                custrecord_hdr_exchange_rate as fx
                                from 
                                customrecord_h_usd_rate
                                where custrecord_hdr_date <= '${date}'
                                order by custrecord_hdr_date DESC
                                fetch first 1 rows only`
                }).asMappedResults();
                return Rate_QL[0].fx
            }
            function formatDate(testDate){
                var responseDate=format.format({value:testDate,type:format.Type.DATE});
                return responseDate
            }            
            exports.beforeLoad = beforeload
            return exports
        }
    );
    
