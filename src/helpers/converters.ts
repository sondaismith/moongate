export function convertToShortTimestamp(ts:string = ""){
    try{
        if(ts == "") throw Error('empty string passed to method');
        var date = new Date(ts);
        if(Number.isNaN(date.valueOf())) throw Error('Invalid date');

        var curDate = new Date();

        var day = date.getDate();
        var year = date.getFullYear();
        var month = date.getMonth()+1;
        var hour = date.getUTCHours();
        var minute = date.getUTCMinutes();

        var isSameHour = (curDate.getTime() - date.getTime())<(1000*60*60);
        var isSameDay = curDate.getUTCDate() == date.getUTCDate();
        var isSameYear = curDate.getFullYear() == date.getFullYear();

        var dateFormat = "";
        if(isSameHour){
            var diff = (curDate.getUTCMinutes() - date.getUTCMinutes());
            dateFormat = (diff<0?diff+60:diff)+'m'; //if diff is negative, add 60(mins) to get real minutes
        }
        else if(isSameDay){
            var diff = (curDate.getTime() - date.getTime())
            //Avoids situations where 13:19-11:59 would return 2h
            //Maybe we eventually choose to round up...
            dateFormat = Math.floor(diff/(1000*60*60))+'h';
        }
        else if(isSameYear){
            dateFormat = getMonthNameShort(date, 'en-US')+" "+day;
        }
        else{
            dateFormat = getMonthNameShort(date, 'en-US')+" "+day+" "+year;
        }

        return dateFormat;
    }
    catch(error){
        //Eventually log errors in database or log file
        return 'invalid';
    }
}

export function convertToLongTimestamp(ts:string = ""){
    try{
        if(ts == "") throw Error('empty string passed to method');
        var date = new Date(ts);
        //check if date is valid
        if(Number.isNaN(date.valueOf())) throw Error('Invalid date');
        var day = date.getDate();
        var year = date.getFullYear();
        // var month = date.getMonth()+1;
        var hour = date.getHours();
        var minute = date.getMinutes();
        var prepend = hour >= 12?"PM":"AM";
        var displayHour = 0;
        if(hour == 0){
            displayHour = 12;
        }
        else{
            displayHour = hour<13?hour:hour%12;
        }

        // String(hour).padStart(2,'0') //padded 24-hour hour value
        return getMonthName(date, 'en-US')+
        ' '+day+', '+year+' at '+
        displayHour+':'+String(minute).padStart(2,'0')+' '+prepend;
    }
    catch(error){
        //Eventually log errors in database or log file
        //console.log(error.message);
        return 'invalid';
    }
}

function getDayName(dateObj:Date, locale:string){
    return dateObj.toLocaleDateString(locale, { weekday: 'long' });
}
function getDayNameShort(dateObj:Date, locale:string){
    return dateObj.toLocaleDateString(locale, { weekday: 'short' });
}

function getMonthName(dateObj:Date, locale:string){
    return dateObj.toLocaleDateString(locale, { month: 'long' });
}

function getMonthNameShort(dateObj:Date, locale:string){
    return dateObj.toLocaleDateString(locale, { month: 'short' });
}