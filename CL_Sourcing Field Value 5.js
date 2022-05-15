/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

define(['N/currentRecord','N/format','N/search','N/currency','N/ui/dialog','N/record','N/query'],
    function (currentRecord,format,search,currency,ui,record,query) {
        var exports = {};
        function fieldChanged(scriptContext) {
         var rec = scriptContext.currentRecord;
         var name = scriptContext.fieldId;
         var list = scriptContext.sublistId;
         //log.debug('Field Change',scriptContext)
         if (list == 'item' && name == 'custcol_dangot_original_item'){
            try{
                log.debug('****-Field Change Start-****',name);
                var itemID = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_dangot_original_item'});
                if (!isNullOrEmpty(itemID)){
                    var Custid = rec.getValue('entity');
                    var Tran_Date = rec.getValue('trandate')
                    var Price_Level = rec.getValue('custbody_dangot_price_list')
                    var Tran_currency = rec.getValue('currency');
                    var Conversion_Rate = 1
                    var itemqty = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'quantity'});
                    if (isNullOrEmpty(Price_Level)){
                            Price_Level = '1'
                    }
                    if(!isNullOrEmpty(itemID) && !isNullOrEmpty(Custid)){   
                        var statment = `select
                                        itemtype
                                        from item
                                        where id = ${itemID} 
                                        fetch first 1 rows only `
                        var pl_query = query.runSuiteQL({query:statment}).asMappedResults()
                        
                    }
                    log.debug({
                        title: 'Change Query',
                        details: pl_query
                    })  
                    if (pl_query[0].itemtype == 'NonInvtPart'){
                        rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'item',value: itemID});
                    }
                    else{
                        rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'item',value: '22765'})
                    }
                }
            log.debug('****-Field Change End-****',name);
            }catch(e)
            {log.debug('****-Field Change End-****',e)}
        }    
        }
        function postSourcing(scriptContext) {
            try{
                var rec = scriptContext.currentRecord;
                var name = scriptContext.fieldId;
                var list = scriptContext.sublistId;
                if (name == 'item' && list == 'item') {   
                    log.debug('****- PostSorsing Start-****',name);     
                    var item = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'item'});
                    var PL_Item = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_price_list_item'});
                    var PriceList_Item = item;
                    if (item != PL_Item){
                        if (!isNullOrEmpty(item)) {                        
                            var Custid = rec.getValue('entity');
                            var Tran_Date = rec.getValue('trandate')
                            var Price_Level = rec.getValue('custbody_dangot_price_list')
                            var Quote_Item = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_dangot_original_item'});
                            if (!isNullOrEmpty(Quote_Item)){
                                PriceList_Item = Quote_Item
                            }
                            var Tran_currency = rec.getValue('currency');
                            var Conversion_Rate = 1
                            var itemqty = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'quantity'});
                            if (isNullOrEmpty(Price_Level)){
                                Price_Level = '1'
                            }
                            if(!isNullOrEmpty(Custid)){
                                var query_str = `
                                select
                                i.itemtype,
                                i.description as desc,
                                pl.*,
                                case when type = 'customer' then 9 else ${Price_Level} end as pricelist
                                from item as i
                                left join ( 
                                    select
                                        c.custrecord_cp_item as item ,
                                        'customer' as  type,
                                        c.custrecord_cp_currency as currency,
                                        c.custrecord_cp_rate as rate,
                                        c.custrecord_cp_recurring_rate as recurring_rate,
                                        c.custrecord_cp_billing_cycle as billing_cycle,
                                        c.custrecord_cp_charging_type as charge_type,
                                        c.custrecord_cp_recurring_rate_2 as recurring_rate_2,
                                        c.custrecord_cp_billing_cycle_2 as billing_cycle_2,
                                        c.custrecord_cp_charging_type_2 as charge_type_2
                                    from customrecord_customer_price_list as c 
                                    where c.custrecord_cp_customer = ${Custid}
                                        UNION ALL
                                    select
                                        p.custrecord_price_item as item,
                                        'price' as type,
                                        p.custrecord_price_currency as currency,
                                        p.custrecord_price_rate as rate,
                                        p.custrecord_price_recurring_rate as recurring_rate,
                                        p.custrecord_price_billing_cycle as billing_cycle,
                                        p.custrecord_price_charging_type as charge_type,
                                        p.custrecord_price_recurring_rate_2 as recurring_rate_2,
                                        p.custrecord_price_billing_cycle_2 as billing_cycle_2,
                                        p.custrecord_price_charging_type_2 as charge_type_2
                                    from customrecord_price_list as p 
                                        where p.custrecord_price_price_level = ${Price_Level}
                                    ) as pl on pl.item = i.id
                                where i.id = ${PriceList_Item}
                                fetch first 1 rows only`
                            var pl_query = query.runSuiteQL({ query: query_str }).asMappedResults()
                            log.debug("pl_query", JSON.stringify(pl_query))
                            if (!isNullOrEmpty(pl_query[0].item) ){ 
                                Price_Level = pl_query[0].pricelist;
                                log.debug({
                                    title: 'Price Level',
                                    details: Price_Level
                                })
                                var HD_Value = false
                                var High_Dollar = rec.getText({fieldId: 'custbody_h_usd_rate'});
                                if (High_Dollar == 'T'){
                                    HD_Value = true
                                }
                                if (!isNullOrEmpty(pl_query[0].rate)) {rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'description', value: pl_query[0].desc })};
                                if (!isNullOrEmpty(pl_query[0].rate)) {rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_original_price', value: pl_query[0].rate })}; 
                                if (!isNullOrEmpty(pl_query[0].currency)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_item_currency',value: pl_query[0].currency })}; 
                                if (!isNullOrEmpty(pl_query[0].recurring_rate)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_reccuring_rate',value: pl_query[0].recurring_rate })}; 
                                if (!isNullOrEmpty(pl_query[0].billing_cycle)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_bs_billing_cycle',value: pl_query[0].billing_cycle })};
                                //if (!isNullOrEmpty(pl_query[0].billing_cycle)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_high_usd_hidden',value: High_Dollar })}; 
                                if (!isNullOrEmpty(pl_query[0].charge_type)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_dangot_recurring_charge_type',value: pl_query[0].charge_type })}; 
                                if (!isNullOrEmpty(pl_query[0].recurring_rate_2)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_recurring_second_year',value: pl_query[0].recurring_rate_2 })}; 
                                if (!isNullOrEmpty(pl_query[0].billing_cycle_2)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_billing_cycle_2',value: pl_query[0].billing_cycle_2 })}; 
                                if (!isNullOrEmpty(pl_query[0].charge_type_2)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_charge_type_2',value: pl_query[0].charge_type_2 })}; 
                                if (Tran_currency != pl_query[0].currency){
                                    if (Tran_currency == 5 && pl_query[0].currency == 1 && High_Dollar == 'T'){
                                        Conversion_Rate = HRDollar(formatDate(Tran_Date));
                                    }
                                    else{
                                        Conversion_Rate = currency.exchangeRate({source: pl_query[0].currency, target: Tran_currency,date:Tran_Date})
                                    }
                                }
                                var ratecalc = pl_query[0].rate * Conversion_Rate
                                rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'rate',value: ratecalc.toFixed(2) ,ignoreFieldChange:true});
                                rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'amount',value: pl_query[0].rate * Conversion_Rate * itemqty,ignoreFieldChange:true});
                                if (!isNullOrEmpty(pl_query[0].currency)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_original_currency_hidden',value: pl_query[0].currency })};
                                if (!isNullOrEmpty(pl_query[0].rate)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_original_price_hidden',value: pl_query[0].rate })};   
                            }
                            else {
                                rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'rate',value: 0 ,ignoreFieldChange:true});
                                rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'amount',value: 0 ,ignoreFieldChange:true});
                                rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_original_currency_hidden',value: '' ,ignoreFieldChange:true});
                                rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_original_price_hidden',value: 0 ,ignoreFieldChange:true});
                            }           
                            rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_price_list_item',value: item ,ignoreFieldChange:true});
                            rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_dangot_price_level',value: Price_Level,ignoreFieldChange:true});
                            rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_original_conversion_rate',value: Conversion_Rate });                      
                            
                            }
                        }
                        log.debug('****- PostSorsing End-****',name);
                    }
                }                 
            }catch(e){
                log.debug("****- PostSorsing End-****",e)
            }
        }
        function validateLine  (scriptContext) {
            try{
                var rec = scriptContext.currentRecord;
                var sublistName = scriptContext.sublistId;
                if (sublistName === 'item'){
                    log.debug('****-Validate Line-****',sublistName);
                    var RecalcPrice = false
                    var AgrType = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_bs_agr_type'});
                    var Original_Currency = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_original_currency_hidden'});
                    var Original_Price = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_original_price_hidden'});
                    var Original_Conversion_Rate = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_original_conversion_rate'});
                    var Item_Price = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_original_price'});
                    var Item_Rate = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'rate'});
                    var Item_Currency = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_item_currency'});
                    if (isNullOrEmpty(Item_Currency)){
                        Item_Currency = Tran_currency
                    }
                    if (Original_Currency !=Item_Currency){
                        RecalcPrice = true
                        log.debug({
                        title: 'Original_Currency <> Item_Currency',
                        details: '{Original_Currency:'+Original_Currency+',Item_Currency :' + Item_Currency +'}'
                        })
                    }
                    if (Item_Rate!=(Original_Price*Original_Conversion_Rate).toFixed(2)){
                        RecalcPrice = true
                        log.debug({
                        title: 'Item_Rate <> (Original_Price*Original_Conversion_Rate)',
                        details: '{Item_Rate:'+Item_Rate+',Calc :' + (Original_Price*Original_Conversion_Rate) +'}'
                        })
                    }
                    if (Item_Price!=Original_Price){
                        RecalcPrice = true
                        log.debug({
                        title: 'Item <> Original Price',
                        details: '{Item_Price:'+Item_Price+',Original_Price :' + Original_Price +'}'
                        })
                    }
                    if (RecalcPrice){
                            var Tran_Date = rec.getValue('trandate')
                            var Tran_currency = rec.getValue('currency');
                            var Conversion_Rate = 1
                            var itemqty = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'quantity'});
                            if (!isNullOrEmpty(Item_Price)){
                                if (Tran_currency != Item_Currency){
                                    if (rec.getText('custbody_h_usd_rate') == 'T' && Tran_currency == 5 & Item_Currency == 1){
                                        Conversion_Rate = HRDollar(formatDate(Tran_Date));
                                        log.debug({
                                            title: 'Conversion  ',
                                            details: Conversion_Rate
                                        })
                                    }
                                    else{
                                        Conversion_Rate = currency.exchangeRate({source: Item_Currency, target: Tran_currency,date:Tran_Date})
                                    }
                                }
                            var ratecalc = Item_Price * Conversion_Rate
                            rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'rate',value: ratecalc.toFixed(2) ,ignoreFieldChange:true});
                            rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'amount',value: Item_Price * Conversion_Rate * itemqty,ignoreFieldChange:true});
                            rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_dangot_price_level',value:'8',ignoreFieldChange:true});//Custom Price Calc
                        }
                    }
                    var Order_type = rec.getValue('custbody_dangot_sale_type');
                    if (Order_type == 1){
                        var item_rec = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'item'});
                        if (!isNullOrEmpty(item_rec)){
                            var queryResults = query.runSuiteQL({
                                query: `SELECT item.isserialitem FROM item WHERE item.id = ${item_rec}` 
                            }).asMappedResults()
                            if (queryResults[0].isserialitem == 'T'){
                                AgrType = '1'
                                rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_bs_agr_type', value: 1});
                            }
                        }
                    }
                    if (!isNullOrEmpty(AgrType)){
                        var Misssing_Fieds = []
                        if (AgrType == '1'){
                            var Site_Warranty = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_lab_warranty'});
                            var Lab_Warranty = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_lab_warranty'});
                            if(isNullOrEmpty(Site_Warranty)){ Misssing_Fieds.push('Site Warranty Month')};
                            if(isNullOrEmpty(Lab_Warranty)){ Misssing_Fieds.push('Lab Warranty Month')};
                        }
                        if (AgrType == '2'){
                            var Billing_Cycle = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_bs_billing_cycle'});
                            var Sub_Type = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_agr_sub_type'});
                            var Rate = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_reccuring_rate'});
                            var First_Period = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_month_first_period'});
                            if(isNullOrEmpty(Billing_Cycle)){ Misssing_Fieds.push('Billing Cycle')};
                            if(isNullOrEmpty(Sub_Type)){ Misssing_Fieds.push('Sub_Type')};
                            if(isNullOrEmpty(Rate)){ Misssing_Fieds.push('Reccuring Rate')};
                            if (!isNullOrEmpty(First_Period)){
                                var Billing_Cycle_2 = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_billing_cycle_2'});
                                var Rate_2 = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_recurring_second_year'});
                                if(isNullOrEmpty(Billing_Cycle_2)){ Misssing_Fieds.push('Billng Cycle For Second Period')};
                                if(isNullOrEmpty(Rate_2)){ Misssing_Fieds.push('Reccurrig Rate For Second Period')};
                            }
                        }
                        var Error_Length = Misssing_Fieds.length;
                        if (Error_Length == 1){
                            ui.alert({title: 'Missing Billing Value',message: 'Please enter '+ Misssing_Fieds +' before submit the line' })
                            return false
                        }
                        log.debug({
                            title: 'Missing Fields: '+Error_Length,
                            details: Misssing_Fieds
                        })
                        if (Error_Length > 1){
                            for (var i = 0; i < Error_Length; i++){
                                if ( i == 0){
                                    var Text = ''+Misssing_Fieds[i]
                                }
                                else {
                                    Text = Text + ', '+Misssing_Fieds[i]
                                }
                            }
                            ui.alert({title: 'Missing Billing Values',message: 'Please enter the follwing fields: '+ Text +' before submit the line' })
                            return false
                        } 
                    }
                    log.debug('****-Validate Line Item-****',sublistName);
                    return true
                }
                else{
                    return true
                }
            }catch(e){
                log.debug({
                    title: "validateLine Error",
                    details: e
                })
            return true
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
        exports.fieldChanged = fieldChanged;
        exports.validateLine = validateLine;
        exports.postSourcing = postSourcing;
        return exports
    });