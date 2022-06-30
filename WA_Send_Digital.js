/**
 * @NApiVersion 2.1
 * @NScriptType workflowactionscript
 */

/*******************************************************************
 * Name 		: Update Record
 * Script Type  : Workflow Action
 * Created On   : 
 * Script Owner : Daniel Starkman
 * Purpose 		: This script is used to send email with diagram attchment
 ********************************************************************/

 define(['N/url','N/record','N/email','N/file'],
    function(url,record,email,file) {
        var exports = {};
        function onAction(context) {
            try{
                var Record = context.newRecord;
                var recordId = Record.id;
                log.debug('recordId',recordId);
                var Attached = Record.getValue({
                    fieldId: 'custbody_ilo_signed_document'
                });
                var Vendor_email = Record.getValue({
                    fieldId: 'email'
                });   
                if(!isNullOrEmpty(Vendor_email)&&!isNullOrEmpty(Attached)){
                    var senderId = 4148
                    var attachments_File = file.load({    
                        id: Attached
                    });
                    var vendorID = Record.getValue({
                        fieldId: 'entity'
                    });
                    var RecType = Record.type
                    log.debug({
                        title: 'attachments_File',
                        details: attachments_File
                    });
                    email.send({
                        author: senderId,
                        recipients: Vendor_email,
                        subject: 'Test Sample Email Module',
                        body: 'email body',
                        attachments:[file.load({id: Attached})] ,
                        relatedRecords: {
                            entityId: vendorID,
                            customRecord: {
                                id: recordId,
                                recordType: RecType
                            }    
                        }
                    });  
                    log.debug('Record edit Sync ID',recordId);
                }
            }catch(ex){
            log.error('Error while updating Record Sync ',ex.message);
            }	
        }
        function isNullOrEmpty(val) {
            if (typeof (val) == 'undefined' || val == null || (typeof (val) == 'string' && val.length == 0)) {
                return true;
            }
            return false;
        }
        exports.onAction = onAction
        return exports;

    }
    );