/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */

define(['N/search','N/currency','N/ui/dialog','N/record'],
    function ( search,currency,ui,record ) {
        var exports = {};
        function postSourcing(scriptContext) {
            var rec = scriptContext.currentRecord;
            var name = scriptContext.fieldId;
            
            if (name == 'item') {
                var Subsidairy = rec.getValue('subsidiary')
                if (Subsidairy != '12'){
                    return
                }
                else{
                        
                        var ItemPriceLevel = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_price_list_item'});
                        var itemID = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'item'});
                        if (itemID !=ItemPriceLevel){
                        var Custid = rec.getValue('entity');
                        var Tran_Date = rec.getValue('trandate')
                        var Price_Level = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_dangot_price_level'});
                        var Tran_currency = rec.getValue('currency');
                        var Conversion_Rate = 1
                        var itemqty = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'quantity'});
                        if (isNullOrEmpty(Price_Level)){
                            Price_Level = '1'
                        }
                        if(!isNullOrEmpty(itemID) && !isNullOrEmpty(Custid)){
                            var Price = GetPrice(itemID,Custid,Price_Level)
                            log.debug({
                                title: 'Price',
                                details: Price
                            })
                                          }
                        rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'price',value: '-1'});    
                        if (!isNullOrEmpty(Price.PL_ID)){

                            if (!isNullOrEmpty(Price.PL_Original_Rate)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_original_price',value: Price.PL_Original_Rate })}; 
                            if (!isNullOrEmpty(Price.PL_Price_Currency)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_item_currency',value: Price.PL_Price_Currency })}; 
                            if (!isNullOrEmpty(Price.PL_Reccuring)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_reccuring_rate',value: Price.PL_Reccuring })}; 
                            if (!isNullOrEmpty(Price.PL_Billing_Cycle)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_bs_billing_cycle',value: Price.PL_Billing_Cycle })}; 
                            if (!isNullOrEmpty(Price.PL_Charging_Type)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_dangot_recurring_charge_type',value: Price.PL_Charging_Type })}; 
                            if (!isNullOrEmpty(Price.PL_Reccuring_2)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_recurring_second_year',value: Price.PL_Reccuring_2 })}; 
                            if (!isNullOrEmpty(Price.PL_Billing_Cycle_2)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_billing_cycle_2',value: Price.PL_Billing_Cycle_2 })}; 
                            if (!isNullOrEmpty(Price.PL_Charging_Type_2)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_charge_type_2',value: Price.PL_Charging_Type_2 })}; 
                            if (Tran_currency != Price.PL_Price_Currency){
                                var Conversion_Rate = currency.exchangeRate({source: Price.PL_Price_Currency, target: Tran_currency,date:Tran_Date})
                            }
                            var ratecalc = Price.PL_Original_Rate * Conversion_Rate
                            rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'rate',value: ratecalc.toFixed(2) ,ignoreFieldChange:true});
                            rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'amount',value: Price.PL_Original_Rate * Conversion_Rate * itemqty,ignoreFieldChange:true});
                            
                        }
                        else {
                            rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'rate',value: 0 ,ignoreFieldChange:true});
                            rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'amount',value: 0 ,ignoreFieldChange:true});
                            
                        }
                        rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_price_list_item',value: itemID,ignoreFieldChange:true});
                        //rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_recalc_price',value: true,ignoreFieldChange:true});
               
                    }
                }
            }
        }
        
        function validateLine  (scriptContext) {
            var rec = scriptContext.currentRecord;
            var sublistName = scriptContext.sublistId;
            if (sublistName === 'item'){
            var AgrType = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_bs_agr_type'});
            var RecalcPrice = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_recalc_price'});
            if (RecalcPrice){
                var itemID = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'item'});
                var Custid = rec.getValue('entity');
                var Tran_Date = rec.getValue('trandate')
                var Price_Level = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_dangot_price_level'});
                if (isNullOrEmpty(Price_Level)){
                    Price_Level = '1'
                }
                Tran_currency = rec.getValue('currency');
                Conversion_Rate = 1
                itemqty = rec.getCurrentSublistValue({sublistId: 'item',fieldId: 'quantity'});
                var Price = GetPrice(itemID,Custid,Price_Level)
                
                if (!isNullOrEmpty(Price.PL_Original_Rate)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_original_price',value: Price.PL_Original_Rate })}; 
                if (!isNullOrEmpty(Price.PL_Price_Currency)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_item_currency',value: Price.PL_Price_Currency })}; 
                if (!isNullOrEmpty(Price.PL_Reccuring)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_reccuring_rate',value: Price.PL_Reccuring })}; 
                if (!isNullOrEmpty(Price.PL_Billing_Cycle)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_bs_billing_cycle',value: Price.PL_Billing_Cycle })}; 
                if (!isNullOrEmpty(Price.PL_Charging_Type)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_dangot_recurring_charge_type',value: Price.PL_Charging_Type })}; 
                if (!isNullOrEmpty(Price.PL_Reccuring_2)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_recurring_second_year',value: Price.PL_Reccuring_2 })}; 
                if (!isNullOrEmpty(Price.PL_Billing_Cycle_2)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_billing_cycle_2',value: Price.PL_Billing_Cycle_2 })}; 
                if (!isNullOrEmpty(Price.PL_Charging_Type_2)){rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_charge_type_2',value: Price.PL_Charging_Type_2 })}; 
                if (Tran_currency != Price.PL_Price_Currency){
                    var Conversion_Rate = currency.exchangeRate({source: Price.PL_Price_Currency, target: Tran_currency,date:Tran_Date})
                }
                var ratecalc = Price.PL_Original_Rate * Conversion_Rate
                rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'rate',value: ratecalc.toFixed(2) ,ignoreFieldChange:true});
                rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'amount',value: Price.PL_Original_Rate * Conversion_Rate * itemqty,ignoreFieldChange:true});
                rec.setCurrentSublistValue({sublistId: 'item',fieldId:'custcol_recalc_price',value: false,ignoreFieldChange:true})
                

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

        function GetPrice(itemID,Custid,Price_Level){
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
            return {
                'PL_ID':Rec_PL_ID,
                'PL_Original_Rate': PL_Original_Rate,
                'PL_Price_Currency':PL_Price_Currency,
                'PL_Reccuring':PL_Reccuring,
                'PL_Billing_Cycle':PL_Billing_Cycle,
                'PL_Charging_Type':PL_Charging_Type,
                'PL_Reccuring_2':PL_Reccuring_2,
                'PL_Billing_Cycle_2':PL_Billing_Cycle_2,
                'PL_Charging_Type_2':PL_Charging_Type_2,
            }
        }
        exports.validateLine    = validateLine   
        exports.postSourcing = postSourcing
        return exports
    });