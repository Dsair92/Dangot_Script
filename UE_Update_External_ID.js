/**
 * @NAPIVersion 2.0
 * @NscriptType UserEventScript
 * @NmoduleScope SameAccount
 * 
 */

define(['N/record', 'N/error', 'N/search', 'N/format', 'N/log','N/currentRecord'],
    function (record, error, search, format, log,crec) {
        var exports = {}
        function createtask(context) {
           
            var RecID = context.newRecord.id
            var Rec = record.load({type:'customrecord_price_list' ,id: RecID ,isDynamic: boolean,})
            var Item = Record.getField({fieldId: 'custrecord_price_item'})
                Rec.setField

            
            return 
        }; 
        exports.beforeSubmit = createtask
        //exports.fieldChanged = fieldChanged
        return exports
}
);

