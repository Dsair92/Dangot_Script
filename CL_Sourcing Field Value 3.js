/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */

define(['N/search','N/currency','N/ui/dialog','N/record'],
    function ( search,currency,ui,record) {
        var exports = {};
        function postSourcing(scriptContext) {

            debugger;
            var FindPrice = false
            var rec = scriptContext.currentRecord;
            var name = scriptContext.fieldId;
            
            if (name == 'item') {
                var Subsidairy = rec.getValue('subsidiary')
                if (Subsidairy != '12'){
                    return
                }
                else{
                        
                        var OldItem = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_price_list_item'});
                        var itemID = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'item'});
                        if (itemID !=OldItem){
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
                            var Pricelist_cust = search.create({
                                type: 'customrecord_customer_price_list',
                                filters: [['custrecord_cp_item', 'anyof', itemID],'AND',['custrecord_cp_customer', 'anyof', Custid]],
                                })
                            var Pricelist_cust_Result = Pricelist_cust.run().getRange({start: 0,end: 1});
                            var Custprice = Pricelist_cust_Result.length
                            if (Custprice == 1){
                                var Rec_PL_ID = Pricelist_cust_Result[0].id
                                var PL_Rec = record.load({
                                    type: 'customrecord_customer_price_list',
                                    id: Rec_PL_ID,
                                    isDynamic: false
                                    })
                                var PL_Original_Rate = PL_Rec.getValue('custrecord_cp_rate');
                                var PL_Price_Currency = PL_Rec.getValue('custrecord_cp_currency');
                                var PL_Reccuring = PL_Rec.getValue('custrecord_cp_recurring_rate');
                                var PL_Billing_Cycle = PL_Rec.getValue('custrecord_cp_billing_cycle');
                                var PL_Charging_Type = PL_Rec.getValue('custrecord_cp_charging_type');
                                var PL_Reccuring_2 = PL_Rec.getValue('custrecord_cp_recurring_rate_2');
                                var PL_Billing_Cycle_2 = PL_Rec.getValue('custrecord_cp_billing_cycle_2');
                                var PL_Charging_Type_2 = PL_Rec.getValue('custrecord_cp_charging_type_2');
                                Price_Level = '9' // Customer Price Level 
                            }
                            else{
                                var Pricelist = search.create({
                                    type: 'customrecord_price_list',
                                    filters: [['custrecord_price_item', 'anyof', itemID],'AND',['custrecord_price_price_level', 'anyof', Price_Level]],
                                    })
                                var Pricelist_Result = Pricelist.run().getRange({start: 0,end: 1});
                                var Levelprice = Pricelist_Result.length
                                if (Levelprice == 1){
                                    var Rec_PL_ID = Pricelist_Result[0].id
                                    var PL_Rec = record.load({
                                    type: 'customrecord_price_list',
                                    id: Rec_PL_ID,
                                    isDynamic: false
                                })
                                var PL_Original_Rate = PL_Rec.getValue('custrecord_price_rate');
                                var PL_Price_Currency = PL_Rec.getValue('custrecord_price_currency');
                                var PL_Reccuring = PL_Rec.getValue('custrecord_price_recurring_rate');
                                var PL_Billing_Cycle = PL_Rec.getValue('custrecord_price_billing_cycle');
                                var PL_Charging_Type = PL_Rec.getValue('custrecord_price_charging_type');
                                var PL_Reccuring_2 = PL_Rec.getValue('custrecord_price_recurring_rate_2');
                                var PL_Billing_Cycle_2 = PL_Rec.getValue('custrecord_price_billing_cycle_2');
                                var PL_Charging_Type_2 = PL_Rec.getValue('custrecord_price_charging_type_2');
                                }
                            }
                            var Pricelist_cust = search.create({
                                type: 'customrecord_customer_price_list',
                                filters: [['custrecord_cp_item', 'anyof', itemID],'AND',['custrecord_cp_customer', 'anyof', Custid]],
                                })
                            var Pricelist_cust_Result = Pricelist_cust.run().getRange({start: 0,end: 1});
                            var Custprice = Pricelist_cust_Result.length
                            if (Custprice == 1){
                                var Rec_PL_ID = Pricelist_cust_Result[0].id
                                var PL_Rec = record.load({
                                    type: 'customrecord_customer_price_list',
                                    id: Rec_PL_ID,
                                    isDynamic: false
                                    })
                                var PL_Original_Rate = PL_Rec.getValue('custrecord_cp_rate');
                                var PL_Price_Currency = PL_Rec.getValue('custrecord_cp_currency');
                                var PL_Reccuring = PL_Rec.getValue('custrecord_cp_recurring_rate');
                                var PL_Billing_Cycle = PL_Rec.getValue('custrecord_cp_billing_cycle');
                                var PL_Charging_Type = PL_Rec.getValue('custrecord_cp_charging_type');
                                var PL_Reccuring_2 = PL_Rec.getValue('custrecord_cp_recurring_rate_2');
                                var PL_Billing_Cycle_2 = PL_Rec.getValue('custrecord_cp_billing_cycle_2');
                                var PL_Charging_Type_2 = PL_Rec.getValue('custrecord_cp_charging_type_2');
                            }
                            else{
                                var Pricelist = search.create({
                                    type: 'customrecord_price_list',
                                    filters: [['custrecord_price_item', 'anyof', itemID],'AND',['custrecord_price_price_level', 'anyof', Price_Level]],
                                    })
                                var Pricelist_Result = Pricelist.run().getRange({start: 0,end: 1});
                                var Levelprice = Pricelist_Result.length
                                if (Levelprice == 1){
                                    var Rec_PL_ID = Pricelist_Result[0].id
                                    var PL_Rec = record.load({
                                    type: 'customrecord_price_list',
                                    id: Rec_PL_ID,
                                    isDynamic: false
                                })
                                var PL_Original_Rate = PL_Rec.getValue('custrecord_price_rate');
                                var PL_Price_Currency = PL_Rec.getValue('custrecord_price_currency');
                                var PL_Reccuring = PL_Rec.getValue('custrecord_price_recurring_rate');
                                var PL_Billing_Cycle = PL_Rec.getValue('custrecord_price_billing_cycle');
                                var PL_Charging_Type = PL_Rec.getValue('custrecord_price_charging_type');
                                var PL_Reccuring_2 = PL_Rec.getValue('custrecord_price_recurring_rate_2');
                                var PL_Billing_Cycle_2 = PL_Rec.getValue('custrecord_price_billing_cycle_2');
                                var PL_Charging_Type_2 = PL_Rec.getValue('custrecord_price_charging_type_2');
                                }
                            }
                        }
                        rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'price',value: '-1'});    
                        if (!isNullOrEmpty(Rec_PL_ID)){

                            if (!isNullOrEmpty(PL_Original_Rate)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_original_price',value: PL_Original_Rate })}; 
                            if (!isNullOrEmpty(PL_Price_Currency)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_item_currency',value: PL_Price_Currency })}; 
                            if (!isNullOrEmpty(PL_Reccuring)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_reccuring_rate',value: PL_Reccuring })}; 
                            if (!isNullOrEmpty(PL_Billing_Cycle)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_bs_billing_cycle',value: PL_Billing_Cycle })}; 
                            if (!isNullOrEmpty(PL_Charging_Type)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_dangot_recurring_charge_type',value: PL_Charging_Type })}; 
                            if (!isNullOrEmpty(PL_Reccuring_2)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_recurring_second_year',value: PL_Reccuring_2 })}; 
                            if (!isNullOrEmpty(PL_Billing_Cycle_2)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_billing_cycle_2',value: PL_Billing_Cycle_2 })}; 
                            if (!isNullOrEmpty(PL_Charging_Type_2)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_charge_type_2',value: PL_Charging_Type_2 })}; 
                            if (Tran_currency != PL_Price_Currency){
                                var Conversion_Rate = currency.exchangeRate({source: PL_Price_Currency, target: Tran_currency,date:Tran_Date})
                            }
                            var ratecalc = PL_Original_Rate * Conversion_Rate
                            rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'rate',value: ratecalc.toFixed(2) ,ignoreFieldChange:true});
                            rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'amount',value: PL_Original_Rate * Conversion_Rate * itemqty,ignoreFieldChange:true});
                            if (!isNullOrEmpty(PL_Price_Currency)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_original_currency_hidden',value: PL_Price_Currency })};
                            if (!isNullOrEmpty(PL_Original_Rate)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_original_price_hidden',value: PL_Original_Rate })};  
                           
                            
                        }
                        else {
                            rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'rate',value: 0 ,ignoreFieldChange:true});
                            rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'amount',value: 0 ,ignoreFieldChange:true});
                            rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_original_currency_hidden',value: '' ,ignoreFieldChange:true});
                            rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_original_price_hidden',value: 0 ,ignoreFieldChange:true});
                            
                        }
                        rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_price_list_item',value: itemID,ignoreFieldChange:true});
                        rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_dangot_price_level',value: Price_Level,ignoreFieldChange:true});
                        rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_original_conversion_rate',value: Conversion_Rate });


                       
                        //rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_recalc_price',value: true,ignoreFieldChange:true});
               
                    }
                }
            }
        }
    
        function validateLine  (scriptContext) {
            var rec = scriptContext.currentRecord;
            var sublistName = scriptContext.sublistId;
            if (sublistName === 'item'){
            var RecalcPrice = false
            var AgrType = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_bs_agr_type'});
            //var RecalcPrice = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_recalc_price'});
            var Original_Currency = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_original_currency_hidden'});
            var Original_Price = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_original_price_hidden'});
            var Original_Conversion_Rate = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_original_conversion_rate'});
            var Item_Price = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_original_price'});
            var Item_Rate = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'rate'});
            var Item_Currency = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_item_currency'});
            if (Original_Currency !=Item_Currency){
                RecalcPrice = true
                log.debug({
                    title: 'Original_Currency <> Item_Currency',
                    details: '{Original_Currency:'+Original_Currency+',Item_Currency :' + Item_Currency +'}'
                })
            }
            if (Item_Rate!=(Original_Price*Original_Conversion_Rate)){
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
                var Line_Currency = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_item_currency'});
                var Line_Original_Rate = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_original_price'});
                if (!isNullOrEmpty(Line_Currency)&&!isNullOrEmpty(Line_Original_Rate)){
                if (Tran_currency != Line_Currency){
                    var Conversion_Rate = currency.exchangeRate({source: Line_Currency, target: Tran_currency,date:Tran_Date})
                }
                var ratecalc = Line_Original_Rate * Conversion_Rate
                rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'rate',value: ratecalc.toFixed(2) ,ignoreFieldChange:true});
                rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'amount',value: Line_Original_Rate * Conversion_Rate * itemqty,ignoreFieldChange:true});
                rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_dangot_price_level',value:'8',ignoreFieldChange:true});//Custom Price Calc
                }
            }
            if (!isNullOrEmpty(AgrType)){
                var error = true
                var message = 'Please Enter:'
                if (AgrType == '1'){
                    var Site_Warranty = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_site_warranty'});
                    var Lab_Warranty = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_lab_warranty'});
                    if(isNullOrEmpty(Site_Warranty)){
                        error = false
                        message = message + 'Site Warranty Month, '
                        }
                    if(isNullOrEmpty(Lab_Warranty)){
                            error = false
                            message = message + 'Lab Warranty Month, '
                    }
                }
                if (AgrType == '2'){
                    var Billing_Cycle = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_bs_billing_cycle'});
                    var Sub_Type = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_agr_sub_type'});
                    var Rate = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_reccuring_rate'});
                    var First_Period = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_month_first_period'});
                    if(isNullOrEmpty(Billing_Cycle)){
                        error = false
                        message = message + 'Billing Cycle, '
                    }
                    if(isNullOrEmpty(Sub_Type)){
                        error = false
                        message = message + 'Sub Type, '
                    }
                    if(isNullOrEmpty(Rate)){
                        error = false
                        message = message + 'Reccuring Rate, '
                    }       
                    if (!isNullOrEmpty(First_Period)){
                        var Billing_Cycle_2 = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_billing_cycle_2'});
                        var Rate_2 = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_recurring_second_year'});
                        if(isNullOrEmpty(Billing_Cycle_2)){
                            error = false
                            message = message + 'Billng Cycle For Second Period, '
                        }
                        if(isNullOrEmpty(Rate_2)){
                            error = false
                            message = message + 'Reccurrig Rate For Second Period, '
                        }
                    }
                    
                }
                if (!error){
                    ui.alert({title: 'Missing Billing Values',message: message})
                    return false
                }

            }
            return true
            }
        }
       
        function isNullOrEmpty(val) {
            if (typeof (val) == 'undefined' || val == null || (typeof (val) == 'string' && val.length == 0)) {
                return true;
            }
            return false;
        }

            
        //exports.lineInit = lineInit
        exports.validateLine    = validateLine   
        exports.postSourcing = postSourcing
        return exports
    });