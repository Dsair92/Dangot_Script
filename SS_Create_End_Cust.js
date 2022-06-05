/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
 define(['N/search', 'N/runtime', 'N/format','N/record', 'N/query','N/task'], function(search, runtime,format, record,query, task) {
    var exports = {};
    function execute(context) {
        var end_user_ql = query.runSuiteQL({ query: 
        `select
        id as rec_id, 
        custrecord_euc_external_id as ex_id,
        custrecord_euc_end_user_name as name,
        custrecord_euc_cust as customer_id,
        custrecord_euc_address_1 as address_1,
        custrecord_euc_address_2 as address_2,
        custrecord_euc_address_3 as address_3,
        custrecord_euc_city as city,
        custrecord_euc_country as country,
        custrecord_euc_email as email,
        custrecord_euc_fax as fax,
        custrecord_euc_vat as vat,
        custrecord_euc_phone as phone
        from customrecord_end_cust_creation`
        }).asMappedResults()
        for (var i = 0; i < end_user_ql.length; i++) {
            try{
                log.debug({title: 'Data :' + i ,details: JSON.stringify(end_user_ql[i])});
                var othername = query.runSuiteQL({query:
                    `select
                    externalid,
                    id
                    from othername
                    where externalid =${end_user_ql[i].ex_id} `}).asMappedResults();
                log.debug({
                    title: 'search',
                    details: othername
                })
                var status = 'Update';
                if (othername.length == 0){
                    var End_User = record.create({
                        type: 'othername',
                        isDynamic: true,
                    });
                    status = 'Create'
                }else{
                    var End_User = record.load({type:'othername',id:othername[0].id,isDynamic:false})
                }
                log.debug({
                    title: 'Status',
                    details: status
                })

                if(!isNullOrEmpty(end_user_ql[i].name)){End_User.setValue('companyname',end_user_ql[i].name)};
                if(!isNullOrEmpty(end_user_ql[i].email)){End_User.setValue('email',end_user_ql[i].email)};
                if(!isNullOrEmpty(end_user_ql[i].phone)){End_User.setValue('phone',end_user_ql[i].phone)};
                if(!isNullOrEmpty(end_user_ql[i].fax)){End_User.setValue('fax',end_user_ql[i].fax)};
                if(!isNullOrEmpty(end_user_ql[i].vat)){End_User.setValue('vatregnumber',end_user_ql[i].vat)};
                if(!isNullOrEmpty(end_user_ql[i].customer_id)){End_User.setValue('custentity_related_customer',end_user_ql[i].customer_id)};
                if(!isNullOrEmpty(end_user_ql[i].ex_id)){End_User.setValue('externalid',end_user_ql[i].ex_id)};
                if(!isNullOrEmpty(end_user_ql[i].country)){
                    var User_Creation = record.load({
                        type: 'customrecord_end_cust_creation',
                        id: end_user_ql[i].rec_id,
                        isDynamic: false,
                        
                    });
                    var User_Country = GetCountry(User_Creation.getText('custrecord_euc_country'));
                }
                if (status == 'Update'){
                    var AddressCount = End_User.getLineCount({sublistId: "addressbook"});
                    log.debug({
                        title: 'Address',
                        details: AddressCount
                    })
                    if (AddressCount > 0){
                        var Address = End_User.getSublistSubrecord({"sublistId": "addressbook", "fieldId": "addressbookaddress", "line": 0})
                        if(!isNullOrEmpty(end_user_ql[i].country)){Address.setValue('country',User_Country);}
                        if(!isNullOrEmpty(end_user_ql[i].city)){Address.setValue('city',end_user_ql[i].city);}
                        if(!isNullOrEmpty(end_user_ql[i].address_1)){Address.setValue('addr1',end_user_ql[i].address_1);}
                        if(!isNullOrEmpty(end_user_ql[i].address_2)){Address.setValue('addr2',end_user_ql[i].address_2);}
                        if(!isNullOrEmpty(end_user_ql[i].address_3)){Address.setValue('addr3',end_user_ql[i].address_3);}
                    }
                    if (AddressCount == 0 &!isNullOrEmpty(end_user_ql[i].country)){
                        End_User.insertLine({sublistId: 'addressbook',line: 0})
                        var Address = End_User.getSublistSubrecord({"sublistId": "addressbook", "fieldId": "addressbookaddress", "line": 0})
                        if(!isNullOrEmpty(end_user_ql[i].country)){Address.setValue('country',User_Country);}
                        if(!isNullOrEmpty(end_user_ql[i].city)){Address.setValue('city',end_user_ql[i].city);}
                        if(!isNullOrEmpty(end_user_ql[i].address_1)){Address.setValue('addr1',end_user_ql[i].address_1);}
                        if(!isNullOrEmpty(end_user_ql[i].address_2)){Address.setValue('addr2',end_user_ql[i].address_2);}
                        if(!isNullOrEmpty(end_user_ql[i].address_3)){Address.setValue('addr3',end_user_ql[i].address_3);}
                    }
                    End_User.save();
                }
                if (status == 'Create'){
                    End_User.setValue('subsidiary','14'); // Dangot
                    End_User.setValue('category','1');    
                    var Rec = End_User.save();
                    if (!isNullOrEmpty(end_user_ql[i].country)){
                        var S_Other_Name = record.load({type:'othername',id:Rec,isDynamic:false})
                        S_Other_Name.insertLine({sublistId: 'addressbook',line: 0,});
                        var Address = S_Other_Name.getSublistSubrecord({"sublistId": "addressbook", "fieldId": "addressbookaddress", "line": 0}) 
                        Address.setValue('country',User_Country);
                        Address.setValue('city',end_user_ql[i].city);
                        Address.setValue('addr1',end_user_ql[i].address_1);
                        Address.setValue('addr2',end_user_ql[i].address_2);
                        Address.setValue('addr3',end_user_ql[i].address_3);   
                        S_Other_Name.save();
                    }
                    
                }
                //record.delete({type:'customrecord_end_cust_creation',id:end_user_ql[i].rec_id,isDynamic: true});
            }catch(e){
                log.error({
                    title: 'Creation Error',
                    details: e
                })
            }
            if (GetUsage() < 100) {
                var taskId = Reschedule();
                log.debug({title: 'Reschedule',details: 'Task ID : '+taskId});
                return;
            }  
        }
    }
    function isNullOrEmpty(val) {
    if (typeof (val) == 'undefined' || val == null || (typeof (val) == 'string' && val.length == 0)) {
        return true;
    }
    return false;
    }
    function Reschedule() {
        var scriptTask = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT});
        scriptTask.scriptId = runtime.getCurrentScript().id;
        scriptTask.deploymentId = runtime.getCurrentScript().deploymentId;
        scriptTask.submit();
    }
    function GetUsage(){
        var scriptObj = runtime.getCurrentScript();
        var remainingUsage = scriptObj.getRemainingUsage();
        return remainingUsage
    }
    
    function GetCountry(val) {
        if (typeof (val) == 'string'){
        var  Datacountry = val.toLowerCase()   
        var CountryID = ''
        switch (Datacountry) {
                case 'afghanistan': CountryID = 'AF'
                break;
                case 'aland islands': CountryID = 'AX'
                break;
                case 'albania': CountryID = 'AL'
                break;
                case 'algeria': CountryID = 'DZ'
                break;
                case 'american samoa': CountryID = 'AS'
                break;
                case 'andorra': CountryID = 'AD'
                break;
                case 'angola': CountryID = 'AO'
                break;
                case 'anguilla': CountryID = 'AI'
                break;
                case 'antarctica': CountryID = 'AQ'
                break;
                case 'antigua and barbuda': CountryID = 'AG'
                break;
                case 'argentina': CountryID = 'AR'
                break;
                case 'armenia': CountryID = 'AM'
                break;
                case 'aruba': CountryID = 'AW'
                break;
                case 'australia': CountryID = 'AU'
                break;
                case 'austria': CountryID = 'AT'
                break;
                case 'azerbaijan': CountryID = 'AZ'
                break;
                case 'bahamas': CountryID = 'BS'
                break;
                case 'bahrain': CountryID = 'BH'
                break;
                case 'bangladesh': CountryID = 'BD'
                break;
                case 'barbados': CountryID = 'BB'
                break;
                case 'belarus': CountryID = 'BY'
                break;
                case 'belgium': CountryID = 'BE'
                break;
                case 'belize': CountryID = 'BZ'
                break;
                case 'benin': CountryID = 'BJ'
                break;
                case 'bermuda': CountryID = 'BM'
                break;
                case 'bhutan': CountryID = 'BT'
                break;
                case 'bolivia': CountryID = 'BO'
                break;
                case 'bonaire, saint eustatius and saba': CountryID = 'BQ'
                break;
                case 'bosnia and herzegovina': CountryID = 'BA'
                break;
                case 'botswana': CountryID = 'BW'
                break;
                case 'bouvet island': CountryID = 'BV'
                break;
                case 'brazil': CountryID = 'BR'
                break;
                case 'british indian ocean territory': CountryID = 'IO'
                break;
                case 'brunei darussalam': CountryID = 'BN'
                break;
                case 'bulgaria': CountryID = 'BG'
                break;
                case 'burkina faso': CountryID = 'BF'
                break;
                case 'burundi': CountryID = 'BI'
                break;
                case 'cambodia': CountryID = 'KH'
                break;
                case 'cameroon': CountryID = 'CM'
                break;
                case 'canada': CountryID = 'CA'
                break;
                case 'canary islands': CountryID = 'IC'
                break;
                case 'cape verde': CountryID = 'CV'
                break;
                case 'cayman islands': CountryID = 'KY'
                break;
                case 'central african republic': CountryID = 'CF'
                break;
                case 'ceuta and melilla': CountryID = 'EA'
                break;
                case 'chad': CountryID = 'TD'
                break;
                case 'chile': CountryID = 'CL'
                break;
                case 'china': CountryID = 'CN'
                break;
                case 'christmas island': CountryID = 'CX'
                break;
                case 'cocos (keeling) islands': CountryID = 'CC'
                break;
                case 'colombia': CountryID = 'CO'
                break;
                case 'comoros': CountryID = 'KM'
                break;
                case 'congo, democratic republic of': CountryID = 'CD'
                break;
                case 'congo, republic of': CountryID = 'CG'
                break;
                case 'cook islands': CountryID = 'CK'
                break;
                case 'costa rica': CountryID = 'CR'
                break;
                case 'cote divoire': CountryID = 'CI'
                break;
                case 'croatia/hrvatska': CountryID = 'HR'
                break;
                case 'cuba': CountryID = 'CU'
                break;
                case 'curaã§ao': CountryID = 'CW'
                break;
                case 'cyprus': CountryID = 'CY'
                break;
                case 'czech republic': CountryID = 'CZ'
                break;
                case 'denmark': CountryID = 'DK'
                break;
                case 'djibouti': CountryID = 'DJ'
                break;
                case 'dominica': CountryID = 'DM'
                break;
                case 'dominican republic': CountryID = 'DO'
                break;
                case 'east timor': CountryID = 'TL'
                break;
                case 'ecuador': CountryID = 'EC'
                break;
                case 'egypt': CountryID = 'EG'
                break;
                case 'el salvador': CountryID = 'SV'
                break;
                case 'equatorial guinea': CountryID = 'GQ'
                break;
                case 'eritrea': CountryID = 'ER'
                break;
                case 'estonia': CountryID = 'EE'
                break;
                case 'ethiopia': CountryID = 'ET'
                break;
                case 'falkland islands': CountryID = 'FK'
                break;
                case 'faroe islands': CountryID = 'FO'
                break;
                case 'fiji': CountryID = 'FJ'
                break;
                case 'finland': CountryID = 'FI'
                break;
                case 'france': CountryID = 'FR'
                break;
                case 'french guiana': CountryID = 'GF'
                break;
                case 'french polynesia': CountryID = 'PF'
                break;
                case 'french southern territories': CountryID = 'TF'
                break;
                case 'gabon': CountryID = 'GA'
                break;
                case 'gambia': CountryID = 'GM'
                break;
                case 'georgia': CountryID = 'GE'
                break;
                case 'germany': CountryID = 'DE'
                break;
                case 'ghana': CountryID = 'GH'
                break;
                case 'gibraltar': CountryID = 'GI'
                break;
                case 'greece': CountryID = 'GR'
                break;
                case 'greenland': CountryID = 'GL'
                break;
                case 'grenada': CountryID = 'GD'
                break;
                case 'guadeloupe': CountryID = 'GP'
                break;
                case 'guam': CountryID = 'GU'
                break;
                case 'guatemala': CountryID = 'GT'
                break;
                case 'guernsey': CountryID = 'GG'
                break;
                case 'guinea': CountryID = 'GN'
                break;
                case 'guinea-bissau': CountryID = 'GW'
                break;
                case 'guyana': CountryID = 'GY'
                break;
                case 'haiti': CountryID = 'HT'
                break;
                case 'heard and mcdonald islands': CountryID = 'HM'
                break;
                case 'holy see (city vatican state)': CountryID = 'VA'
                break;
                case 'honduras': CountryID = 'HN'
                break;
                case 'hong kong': CountryID = 'HK'
                break;
                case 'hungary': CountryID = 'HU'
                break;
                case 'iceland': CountryID = 'IS'
                break;
                case 'india': CountryID = 'IN'
                break;
                case 'indonesia': CountryID = 'ID'
                break;
                case 'iran (islamic republic of)': CountryID = 'IR'
                break;
                case 'iraq': CountryID = 'IQ'
                break;
                case 'ireland': CountryID = 'IE'
                break;
                case 'isle of man': CountryID = 'IM'
                break;
                case 'israel': CountryID = 'IL'
                break;
                case 'italy': CountryID = 'IT'
                break;
                case 'jamaica': CountryID = 'JM'
                break;
                case 'japan': CountryID = 'JP'
                break;
                case 'jersey': CountryID = 'JE'
                break;
                case 'jordan': CountryID = 'JO'
                break;
                case 'kazakhstan': CountryID = 'KZ'
                break;
                case 'kenya': CountryID = 'KE'
                break;
                case 'kiribati': CountryID = 'KI'
                break;
                case 'korea, democratic peoples republic': CountryID = 'KP'
                break;
                case 'korea, republic of': CountryID = 'KR'
                break;
                case 'kosovo': CountryID = 'XK'
                break;
                case 'kuwait': CountryID = 'KW'
                break;
                case 'kyrgyzstan': CountryID = 'KG'
                break;
                case 'lao peoples democratic republic': CountryID = 'LA'
                break;
                case 'latvia': CountryID = 'LV'
                break;
                case 'lebanon': CountryID = 'LB'
                break;
                case 'lesotho': CountryID = 'LS'
                break;
                case 'liberia': CountryID = 'LR'
                break;
                case 'libya': CountryID = 'LY'
                break;
                case 'liechtenstein': CountryID = 'LI'
                break;
                case 'lithuania': CountryID = 'LT'
                break;
                case 'luxembourg': CountryID = 'LU'
                break;
                case 'macau': CountryID = 'MO'
                break;
                case 'macedonia': CountryID = 'MK'
                break;
                case 'madagascar': CountryID = 'MG'
                break;
                case 'malawi': CountryID = 'MW'
                break;
                case 'malaysia': CountryID = 'MY'
                break;
                case 'maldives': CountryID = 'MV'
                break;
                case 'mali': CountryID = 'ML'
                break;
                case 'malta': CountryID = 'MT'
                break;
                case 'marshall islands': CountryID = 'MH'
                break;
                case 'martinique': CountryID = 'MQ'
                break;
                case 'mauritania': CountryID = 'MR'
                break;
                case 'mauritius': CountryID = 'MU'
                break;
                case 'mayotte': CountryID = 'YT'
                break;
                case 'mexico': CountryID = 'MX'
                break;
                case 'micronesia, federal state of': CountryID = 'FM'
                break;
                case 'moldova, republic of': CountryID = 'MD'
                break;
                case 'monaco': CountryID = 'MC'
                break;
                case 'mongolia': CountryID = 'MN'
                break;
                case 'montenegro': CountryID = 'ME'
                break;
                case 'montserrat': CountryID = 'MS'
                break;
                case 'morocco': CountryID = 'MA'
                break;
                case 'mozambique': CountryID = 'MZ'
                break;
                case 'myanmar (burma)': CountryID = 'MM'
                break;
                case 'namibia': CountryID = 'NA'
                break;
                case 'nauru': CountryID = 'NR'
                break;
                case 'nepal': CountryID = 'NP'
                break;
                case 'netherlands': CountryID = 'NL'
                break;
                case 'netherlands antilles (deprecated)': CountryID = 'AN'
                break;
                case 'new caledonia': CountryID = 'NC'
                break;
                case 'new zealand': CountryID = 'NZ'
                break;
                case 'nicaragua': CountryID = 'NI'
                break;
                case 'niger': CountryID = 'NE'
                break;
                case 'nigeria': CountryID = 'NG'
                break;
                case 'niue': CountryID = 'NU'
                break;
                case 'norfolk island': CountryID = 'NF'
                break;
                case 'northern mariana islands': CountryID = 'MP'
                break;
                case 'norway': CountryID = 'NO'
                break;
                case 'oman': CountryID = 'OM'
                break;
                case 'pakistan': CountryID = 'PK'
                break;
                case 'palau': CountryID = 'PW'
                break;
                case 'palestinian territories': CountryID = 'PS'
                break;
                case 'panama': CountryID = 'PA'
                break;
                case 'papua new guinea': CountryID = 'PG'
                break;
                case 'paraguay': CountryID = 'PY'
                break;
                case 'peru': CountryID = 'PE'
                break;
                case 'philippines': CountryID = 'PH'
                break;
                case 'pitcairn island': CountryID = 'PN'
                break;
                case 'poland': CountryID = 'PL'
                break;
                case 'portugal': CountryID = 'PT'
                break;
                case 'puerto rico': CountryID = 'PR'
                break;
                case 'qatar': CountryID = 'QA'
                break;
                case 'reunion island': CountryID = 'RE'
                break;
                case 'romania': CountryID = 'RO'
                break;
                case 'russian federation': CountryID = 'RU'
                break;
                case 'rwanda': CountryID = 'RW'
                break;
                case 'saint barthã©lemy': CountryID = 'BL'
                break;
                case 'saint helena': CountryID = 'SH'
                break;
                case 'saint kitts and nevis': CountryID = 'KN'
                break;
                case 'saint lucia': CountryID = 'LC'
                break;
                case 'saint martin': CountryID = 'MF'
                break;
                case 'saint vincent and the grenadines': CountryID = 'VC'
                break;
                case 'samoa': CountryID = 'WS'
                break;
                case 'san marino': CountryID = 'SM'
                break;
                case 'sao tome and principe': CountryID = 'ST'
                break;
                case 'saudi arabia': CountryID = 'SA'
                break;
                case 'senegal': CountryID = 'SN'
                break;
                case 'serbia': CountryID = 'RS'
                break;
                case 'serbia and montenegro (deprecated)': CountryID = 'CS'
                break;
                case 'seychelles': CountryID = 'SC'
                break;
                case 'sierra leone': CountryID = 'SL'
                break;
                case 'singapore': CountryID = 'SG'
                break;
                case 'sint maarten': CountryID = 'SX'
                break;
                case 'slovak republic': CountryID = 'SK'
                break;
                case 'slovenia': CountryID = 'SI'
                break;
                case 'solomon islands': CountryID = 'SB'
                break;
                case 'somalia': CountryID = 'SO'
                break;
                case 'south africa': CountryID = 'ZA'
                break;
                case 'south georgia': CountryID = 'GS'
                break;
                case 'south sudan': CountryID = 'SS'
                break;
                case 'spain': CountryID = 'ES'
                break;
                case 'sri lanka': CountryID = 'LK'
                break;
                case 'st. pierre and miquelon': CountryID = 'PM'
                break;
                case 'sudan': CountryID = 'SD'
                break;
                case 'suriname': CountryID = 'SR'
                break;
                case 'svalbard and jan mayen islands': CountryID = 'SJ'
                break;
                case 'swaziland': CountryID = 'SZ'
                break;
                case 'sweden': CountryID = 'SE'
                break;
                case 'switzerland': CountryID = 'CH'
                break;
                case 'syrian arab republic': CountryID = 'SY'
                break;
                case 'taiwan': CountryID = 'TW'
                break;
                case 'tajikistan': CountryID = 'TJ'
                break;
                case 'tanzania': CountryID = 'TZ'
                break;
                case 'thailand': CountryID = 'TH'
                break;
                case 'togo': CountryID = 'TG'
                break;
                case 'tokelau': CountryID = 'TK'
                break;
                case 'tonga': CountryID = 'TO'
                break;
                case 'trinidad and tobago': CountryID = 'TT'
                break;
                case 'tunisia': CountryID = 'TN'
                break;
                case 'turkey': CountryID = 'TR'
                break;
                case 'turkmenistan': CountryID = 'TM'
                break;
                case 'turks and caicos islands': CountryID = 'TC'
                break;
                case 'tuvalu': CountryID = 'TV'
                break;
                case 'uganda': CountryID = 'UG'
                break;
                case 'ukraine': CountryID = 'UA'
                break;
                case 'united arab emirates': CountryID = 'AE'
                break;
                case 'united kingdom': CountryID = 'GB'
                break;
                case 'united states': CountryID = 'US'
                break;
                case 'uruguay': CountryID = 'UY'
                break;
                case 'us minor outlying islands': CountryID = 'UM'
                break;
                case 'uzbekistan': CountryID = 'UZ'
                break;
                case 'vanuatu': CountryID = 'VU'
                break;
                case 'venezuela': CountryID = 'VE'
                break;
                case 'vietnam': CountryID = 'VN'
                break;
                case 'virgin islands (british)': CountryID = 'VG'
                break;
                case 'virgin islands (usa)': CountryID = 'VI'
                break;
                case 'wallis and futuna': CountryID = 'WF'
                break;
                case 'western sahara': CountryID = 'EH'
                break;
                case 'yemen': CountryID = 'YE'
                break;
                case 'zambia': CountryID = 'ZM'
                break;
                case 'zimbabwe': CountryID = 'ZW'
                break;
                default:CountryID = 'ZW'

            }
            }
            else {
                var CountryID = null
            }

            return CountryID
        }        
    exports.execute = execute;
    return exports;
}
);
   