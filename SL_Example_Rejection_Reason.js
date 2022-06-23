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

function onRequest(context) {
 try{

     if(context.request.method ==="GET"){
         var invoiceID = context.request.parameters.invRecId;
         var recType   = context.request.parameters.recordType;
         var subscriptionStatus   = context.request.parameters.subscriptionStatus;	

         var rejectionForm = ui.createForm({
             title: 'Enter Reject Reason'
         });
         var rejectReason = rejectionForm.addField({
             id: 'custpage_dd_inv_reject_reason',
             type: ui.FieldType.SELECT,
             label: 'Reject Reason',
             source:'customlist_hb_rejection_reasons'
         });
         rejectReason.isMandatory = true;

         var invField = rejectionForm.addField({
             id: 'custpage_inv_field',
             type: ui.FieldType.TEXT,
             label: 'Invoice Internal ID',
         }); 

         invField.defaultValue = invoiceID;
         invField.updateDisplayType({displayType: 'HIDDEN'});
         
         var memo = rejectionForm.addField({
             id: 'custpage_inv_field_memo',
             type: ui.FieldType.TEXTAREA,
             label: 'Rejection Memo',
         }); 
         
         var recordTypeField = rejectionForm.addField({
             id: 'custpage_rectype_field',
             type: ui.FieldType.TEXT,
             label: 'RecType',
         }); 

         recordTypeField.defaultValue = recType;
         recordTypeField.updateDisplayType({displayType: 'HIDDEN'});
         
         /**********************/
         var subscriptionStatusField = rejectionForm.addField({
             id: 'custpage_subscription_status',
             type: ui.FieldType.TEXT,
             label: 'subscriptionStatus',
         }); 

         subscriptionStatusField.defaultValue = subscriptionStatus;
         subscriptionStatusField.updateDisplayType({displayType: 'HIDDEN'});
         /**********************/

         rejectionForm.addSubmitButton({
             label: 'Save'
         });

         context.response.writePage(rejectionForm);

     }else{
         var scriptObj = runtime.getCurrentScript(); 
         
         var invRejectionValue = context.request.parameters.custpage_dd_inv_reject_reason;
         var invID             = context.request.parameters.custpage_inv_field;
         var rejMemo           = context.request.parameters.custpage_inv_field_memo;
         var recType           =  context.request.parameters.custpage_rectype_field;
         var jsobObj = {};
         if(recType == 'invoice'){
         var rejectionStatus   = scriptObj.getParameter({name:'custscript_hb_rejection_status'});	
         var jsobObj = {
                 custbody_hb_rejection_reason:invRejectionValue,
                 custbody_hb_rejected_by: runtime.getCurrentUser().id,
                 approvalstatus		:rejectionStatus,
                 custbody_hb_invoice_rejection_reas:rejMemo
             }
         }else if(recType == 'customrecordzab_subscription'){
             
             var subscriptionStatus =  context.request.parameters.custpage_subscription_status;

             log.debug('subscriptionStatus',subscriptionStatus)
             var jsobObj = {
                 custrecord_hb_s_rejection_list:invRejectionValue,
                 custrecord_hb_subscription_rej:rejMemo,
               custrecord_hb_s_rejected_by:runtime.getCurrentUser().id,
               custrecord_hb_subscription_status:subscriptionStatus
             }
         }
         log.debug("jsobObj ",jsobObj);

         record.submitFields({
             type: recType,
             id: invID,
             values: jsobObj
         });
         redirect.toRecord({
             type : recType,
             id : invID
         });

     }
 }catch(ex){
     log.error('error in suitelet',ex);

 }
}

return {
 onRequest: onRequest
};

});
