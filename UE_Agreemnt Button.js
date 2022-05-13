/**
 * @NAPIVersion 2.x
 * @NscriptType UserEventScript
 * @NmoduleScope SameAccount
 * 
 */

 define(['N/record', 'N/error', 'N/search', 'N/format','N/ui/dialog','N/url', 'N/log'],
 function (record, error, search, format,dialog,url,log) {
        

        var exports = {};
        /**
         * 
         * 
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type
         * @param {Form} scriptContext.form - Current form
         *   
         */
        function beforeLoad(scriptContext) {

            var recID = scriptContext.newRecord.id
            var rec = record.load({
                    type: 'customrecord_agr',
                    id: recID,
                    isDynamic: true,              
            })

            var customer = rec.getValue('custrecord_agr_customer')
            var agrstatus = rec.getValue('custrecord_agr_status')
            var thisForm = scriptContext.form;
            var url = URLscript('customscript_renewal_agr_su','customdeploy_renewal_agr_su',customer,agrstatus,recID)
            
            log.debug({
                title: 'URL',
                details: url
            })
            thisForm.addButton({
                id: "custpage_buttonTest",
                label: 'Action Screen',
                functionName: 'actionscreen("' + url + '")'
                

            })
            thisForm.clientScriptModulePath = "SuiteScripts/Billing System/CL_Agreement Button.js"
            
    }
    
    function URLscript(script,deployment,cust,agrstatus,recid) {
        var scheme = 'https://';
        var host = url.resolveDomain({
            hostType: url.HostType.APPLICATION
        });
        
        var relativePath = url.resolveScript({
            scriptId: script,
            deploymentId: deployment,
            returnExternalUrl: false,
            params: {
                custpage_customer : customer,
                custpage_status: agrstatus,
                custpage_action: 1,
                custpage_agr: recID,
                custpage_agr_target: null,
                custpage_cust_target: null 

            }
        });
        
        var myURL = scheme + host +relativePath;
    
        return myURL
        
    }

     
        exports.beforeLoad = beforeLoad;
        //exports.pageInit = pageInit;
        return exports;


}
);
   