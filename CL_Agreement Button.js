/**
 * @NAPIVersion 2.x
 * @NscriptType ClientScript
 * @NmoduleScope SameAccount
 * 
 */

 define(['N/record', 'N/error', 'N/search', 'N/format','N/ui/dialog','N/url', 'N/log'],
 function (record, error, search, format,dialog,url,log) {
        

        var exports = {};

        function actionscreen(url) {
           
            window.location.replace(url)
            
     
    }
        function pageInit(context) {
            
           
            
            log.debug({
                title: "Before Load Context",
                details: output
            });

           /* 
           var button = context.form.addButton({
                id : 'buttonid',
                label : 'Action Screen'
            });
            */
           
        
           
        
        };
      
        function URLscript(script,deployment) {
            var scheme = 'https://';
            var host = url.resolveDomain({
                hostType: url.HostType.APPLICATION
            });
            
            var relativePath = url.resolveScript({
                recordType: script,
                recordId: deployment,
                returnExternalUrl: false,
            });
            
            var myURL = scheme + host +relativePath;
        
            return myURL
            
        }


     
        exports.actionscreen = actionscreen;
        exports.pageInit = pageInit;
        return exports;


}
);

function URLRec(type,id) {
    var scheme = 'https://';
    var host = url.resolveDomain({
        hostType: url.HostType.APPLICATION
    });
    var relativePath = url.resolveRecord({
        recordType: type,
        recordId: id,
        isEditMode: false,
    });
    var myURL = scheme + host + relativePath;
    return myURL

}
