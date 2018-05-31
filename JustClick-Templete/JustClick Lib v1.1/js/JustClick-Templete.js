var justclick = {};

var version = "1 v"

justclick.DateFormate = "DD-mm-YYYY";

var indexArrayKeyWord = "{{@@index}}"
var sequanceArrayKeyWord = "{{@@seq}}"

var dateKeyWord = "{{@@date}}"
var dateDayKeyWord = "{{@@day}}"
var dateMonthKeyWord = "{{@@month}}"
var dateYearKeyWord = "{{@@year}}"
var dateMonthNameKeyWord = "{{@@month-name}}"
var dateHourshKeyWord = "{{@@hours}}"
var dateMinuteKeyWord = "{{@@minutes}}"
var dateSecondKeyWord = "{{@@seconds}}"

var versionKeyWord = "{{@@version}}"

var urlKeyWord = "{{@@url}}"

var templeteDateFormate;
var searchCtrName;
var searchKey;

var filterType;  // on of like , equal

//--------------------------------------------- start added function ----------------------------------------//
String.prototype.replaceAll = function (searchText, replacementText) {
    return this.split(searchText).join(replacementText);
};
//--------------------------------------------- end added function ----------------------------------------//

// compile template by replace property name
function ComplieSimple(_templete, _object) {
    var expression;
    var content_after_proccess = "";
    var propName;
    var filterResult = true;

    // get expression count
    var expressionCount = _templete.split("{{").length - 1;
  
    for (var expressionIndex = 0; expressionIndex < expressionCount; expressionIndex++) {
        // get part expression
        content_after_proccess = content_after_proccess + _templete.substring(0, _templete.indexOf("{{"));
         
        // work with expression
        expression = _templete.substring(_templete.indexOf("{{"), _templete.indexOf("}}") + 2); 
        if (expression.indexOf("{{@@")) {
            // check if complex expression
            if (expression.indexOf("||") != -1) {
                //---- filterType
                propName = expression.substring(2, expression.indexOf("||")).trim();

                if (expression.toLowerCase().indexOf("like")) {
                    //----------- like
                    filterResult = _object[propName].toLowerCase().indexOf(searchKey) != -1;
                } else if (expression.toLowerCase().indexOf("equal")) {
                    //----------- equal
                    filterResult = _object[propName].toLowerCase() == searchKey;
                }

            } else {
                //----- no filter
                propName = expression.replace("{{", "").replace("}}", "");
            }
            content_after_proccess = content_after_proccess + _object[propName];
        } else {
            content_after_proccess = content_after_proccess + expression;
        }

        _templete = _templete.substr(_templete.indexOf("}}") + 2); 
    }

    content_after_proccess = content_after_proccess + _templete;
     
    if (filterResult) {
        return content_after_proccess;
    } else {
        return "";
    }
}

function ComplieArray(_templete, _object) {
    var templete = "";

    for (var index = 0; index < _object.length; index++) {
        templete = templete + ComplieSimple(_templete, _object[index]);
        templete = templete.replace(indexArrayKeyWord, index);
        templete = templete.replace(sequanceArrayKeyWord, index + 1);
    }

    return templete;
}

// pattern {{#each porpName}}
// get propName form the pattern
function getPropName(single_proccess) {
    var propName;

    // get {{#each <<propName>>}} 
    propName = single_proccess.substring(single_proccess.indexOf("{{#each"), single_proccess.indexOf("}}") + 2);

    // remove {{#each from string
    propName = propName.replace("{{#each", "");

    // remove close each }}
    propName = propName.replace("}}", "");

    // remove any space
    propName = propName.trim();

    // just prop name
    return propName;
}

// remove {{#each porpName}} & {{#end-each}}
function clearForEachTemplete(single_proccess) {
    var keyWord = single_proccess.substring(single_proccess.indexOf("{{#each"), single_proccess.indexOf("}}") + 2);

    // remove {{#each porpName}}
    single_proccess = single_proccess.replace(keyWord, "");

    // remove {{#end-each}}
    single_proccess = single_proccess.replace("{{#end-each}}", "");

    return single_proccess;
}

function handleDateTime(content_after_proccess) {
    var _now = new Date();
    var day = _now.getDate();
    var month = _now.getMonth() + 1;
    var monthName = _now.toLocaleString("en-us", { month: "long" });
    var year = _now.getFullYear();
    var hours = _now.getHours(); // => 9
    var minutes = _now.getMinutes(); // =>  30
    var seconds = _now.getSeconds(); // => 51


    // incase of there are date format att use it
    if (templeteDateFormate == null || templeteDateFormate == "") {
        content_after_proccess = content_after_proccess.replace(dateKeyWord, moment().format(justclick.DateFormate));
    } else {
        content_after_proccess = content_after_proccess.replace(dateKeyWord, moment().format(templeteDateFormate));
    }

    content_after_proccess = content_after_proccess.replace(dateDayKeyWord, day);
    content_after_proccess = content_after_proccess.replace(dateMonthKeyWord, month);
    content_after_proccess = content_after_proccess.replace(dateYearKeyWord, year);
    content_after_proccess = content_after_proccess.replace(dateMonthNameKeyWord, monthName);

    content_after_proccess = content_after_proccess.replace(dateHourshKeyWord, hours);
    content_after_proccess = content_after_proccess.replace(dateMinuteKeyWord, minutes);
    content_after_proccess = content_after_proccess.replace(dateSecondKeyWord, seconds);

    return content_after_proccess;
}

justclick.Complie = function (_templeteName, _targetContainerName, _object) {
    console.log("start work");


    templeteDateFormate = $('#' + _templeteName).attr('jc-date-formate');
    searchCtrName = $('#' + _templeteName).attr('jc-search-key');
     
    if ( searchCtrName != null) {
        searchKey = $("#" + searchCtrName).val().toLowerCase();
    }
    var _templete = $("#" + _templeteName).html();
     
    // get loop count
    var loopCount = _templete.split("#each").length - 1;
    var content_after_proccess = "";
    var single_proccess;
    var propName;
     

    for (var index = 0; index < loopCount; index++) {
        // get part before each
        single_proccess = _templete.substring(0, _templete.indexOf("{{#each"));
        content_after_proccess = content_after_proccess + ComplieSimple(single_proccess, _object);

        // get each loop content
        single_proccess = _templete.substring(_templete.indexOf("{{#each"), _templete.indexOf("{{#end-each}}") + 13);
        propName = getPropName(single_proccess);
        single_proccess = clearForEachTemplete(single_proccess);

        if (propName) {
            content_after_proccess = content_after_proccess + ComplieArray(single_proccess, _object[propName]);
        } else {
            content_after_proccess = content_after_proccess + ComplieArray(single_proccess, _object);
        }
        // remove from string
        _templete = _templete.substr(_templete.indexOf("{{#end-each}}") + 13);
    }

    if (_templete.length != 0) {
        content_after_proccess = content_after_proccess + ComplieSimple(_templete, _object);
    }

    // if there are @@index , @@seq not in array
    content_after_proccess = content_after_proccess.replace(indexArrayKeyWord, "");
    content_after_proccess = content_after_proccess.replace(sequanceArrayKeyWord, "");
    content_after_proccess = content_after_proccess.replace(urlKeyWord, window.location.href);
    content_after_proccess = content_after_proccess.replace(versionKeyWord, version);

    // @@date
    content_after_proccess = handleDateTime(content_after_proccess);

    $("#" + _targetContainerName).html(content_after_proccess);
}

justclick.ComplieFromURL = function (_templeteName, _targetContainerName, _serviceURL, params) {
    $.getJSON(_serviceURL, params, function (_object) {
        justclick.Complie(_templeteName, _targetContainerName, _object);
    });
}