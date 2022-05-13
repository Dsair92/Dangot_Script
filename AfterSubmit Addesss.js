    /**
    * demoRestlet.ts
    *@NApiVersion 2.0
    *@NScriptType UserEventScript
    */

 define(['N/record', 'N/error', 'N/search', 'N/format', 'N/log'],
    function (record, error, search, format, log) {
        function afterSubmit (dataIn) {
            log.debug({
                title: 'Get',
                details: dataIn.newRecord.id
            });
            var rec = record.load({
                type: 'salesorder',
                id: dataIn.newRecord.id,
                isDynamic: false,
            })


            var linesnum = rec.getLineCount({
                sublistId: 'item'
            });

            log.debug({
                title: 'Linescount',
                details: linesnum
            })
            var items = rec.getSublist({
                sublistId: 'item'
             })
             
             log.debug({
                title: 'items',
                details: items
            })

            var data =items.getColumn({
                fieldId: 'item'
          });
    
           
        for (var i = 0; i <= linesnum ;  i++) {
            var custline = rec.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_end_customer',
                line: i
            })

            var cust = record.load({
                type: 'othername',
                id: custline,
                isDynamic: false,
            });

            var address = cust.getvalue('companyname')

            log.debug({
                title: 'Line '+ i,
                details: address
            })
            
            log.debug({
                    title: 'line' + i,
                    details: rec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_end_customer',
                        line: i
                    })
                })
            }
         

        }


    

        

        ; return {
            beforeLoad : afterSubmit,
            
        };

}
);
