/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

/*******************************************************************
 * Name 		: HB SL Updating Rejection Reason	
 * Purpose 		: To enter the "Rejection Reason" on click of Reject Button by the user.
 * Script Type  : Suitelet
 * Created On   : 
 * Script Owner : 
 ********************************************************************/


 define(["N/ui/serverWidget","N/record","N/redirect","N/workflow","N/runtime"],

 function(ui,record,redirect,workflow,runtime) {
     var exports = {} 
     function onRequest(context) {
         try{
            if(context.request.method ==="GET"){
            var Agr = context.request.parameters.agr;
            if (!isNullOrEmpty(Agr)){
            var Agr_Rec = record.load({
                type : 'customrecord_agr',
                id: Agr,
                isDynamic: false,
            });
            Agr_Status = Agr_Rec.getValue('custrecord_agr_status');
            Agr_Cust = Agr_Rec.getValue('custrecord_agr_customer');
            }
            var Agr_IB_Creation = ui.createForm({
                title: 'Enter IB File'
            });
            Agr_IB_Creation.clientScriptModulePath = "SuiteScripts/CL_Suitlet_create_IB.js"
            var Cust_Detail = Agr_IB_Creation.addField({
                id: 'custpage_cust_detail',
                type: ui.FieldType.SELECT,
                label: 'Customer',
                source:'customer'
            });
            Cust_Detail.defaultValue = Agr_Cust;
            Cust_Detail.updateDisplayType({displayType: 'INLINE'});
            var Cust_Agr = Agr_IB_Creation.addField({
                id: 'custpage_agr_detail',
                type: ui.FieldType.SELECT,
                label: 'Agreement',
                source:'customrecord_agr'
            });
            Cust_Agr.defaultValue = Agr;
            Cust_Agr.updateDisplayType({displayType: 'INLINE'});
             var IB_File = Agr_IB_Creation.addField({
                 id: 'custpage_detail_ib',
                 type: ui.FieldType.FILE,
                 label: 'IB File',
             });
             Agr_IB_Creation.addSubmitButton({
                 label: 'Save'
             });
             
             context.response.writePage(Agr_IB_Creation);
             log.debug('IB Data' , IB_File)
             }else{
                 var scriptObj = runtime.getCurrentScript();    
                 var cust_id = context.request.parameters.custpage_cust_detail;
                 var ib_detail = context.request.parameters.custpage_detail_ib;
                 var Agr_detail = context.request.parameters.custpage_agr_detail;
                 var jsobObj = {
                    cust_id: cust_id,
                    ib_detail:ib_detail,
                    Agr_detail:Agr_detail
                 }
                 log.debug("jsobObj ",ib_detail);
                 redirect.toRecord({
                     type : 'customrecord_agr',
                     id : Agr_detail
                 });
             }
         }catch(ex){
             log.error('error in suitelet',ex);
         }
     }
     exports.onRequest = onRequest
     return exports
     function isNullOrEmpty(val) {
         if (typeof (val) == 'undefined' || val == null || (typeof (val) == 'string' && val.length == 0)) {
             return true;
         }
         return false;
     }
 }

);
