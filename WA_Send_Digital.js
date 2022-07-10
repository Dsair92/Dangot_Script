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

 define(['N/url','N/record','N/email','N/runtime','N/file','N/render'],
    function(url,record,email,runtime,file,render) {
        var exports = {};
        function onAction(context) {
            try{
                var script = runtime.getCurrentScript();
                var userObj = runtime.getCurrentUser();
                var userID = userObj.id
                var Record = context.newRecord;
                var recordId = Record.id;
                var Template = script.getParameter({ name: "custscript_email_template" });
                var Attched_field_Params = script.getParameter({ name: "custscript_email_attachments_array" });
                var Sender = script.getParameter({ name: "custscript_email_sender" });
                if (isNullOrEmpty(Sender)){
                    Sender = userObj.id
                }
                var Array_field = Attched_field_Params.split(",")
                var Files_Attached = []
                for (a = 0;a  < Array_field.length;a++){
                    var Field = Array_field[a].toString()
                    if (!isNullOrEmpty(Field)){
                        log.debug({
                            title: 'string*',
                            details: Field
                        })
                        var Attached = Record.getValue({
                            fieldId: 'custbody_ilo_signed_document'
                        });
                        if (!isNullOrEmpty(Attached)){
                             var file_loaded = file.load({    
                                id: Attached
                            });
        
                            Files_Attached.push(file_loaded)
                        }
                    }
                }
                var Cust_email = Record.getValue({
                    fieldId: 'email'
                });   
                if(!isNullOrEmpty(Cust_email)&& Files_Attached.length > 0){
                    var Cust_iD = Record.getValue({
                        fieldId: 'entity'
                    });                    
                    var mergeResult = render.mergeEmail({
                        templateId: Template,
                        entity: null,
                        recipient: null,
                        supportCaseId: null, 
                        transactionId: recordId,
                        customRecord: null
                    });
                    var emailSubject = mergeResult.subject; 
                    var emailBody = mergeResult.body; 
                    email.send({
                        author: Sender,
                        recipients: Cust_email,
                        subject: emailSubject,
                        body: emailBody,
                        attachments: Files_Attached ,
                       
                        relatedRecords: {
                            entityId: Cust_iD, 
                            transactionId: recordId  
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