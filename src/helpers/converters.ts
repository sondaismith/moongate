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

/**
 * Method that takes a number value and returns a compact number
 * with a suffix - i.e 12650 is returned as 12.6K.
 * @param num Number to return a compact representation of.
 * @returns Compact representation of passed-in number.
 */
export function getCompactNumberValue(num:number|undefined){
    if(num == undefined) return 0;
    return num.toLocaleString('en-US', {
        notation:"compact",
        compactDisplay:"short",
    });
}

/**
 * Method that takes a URI and converts it into a HTTP URL link that
 * can be used to view the URI content in a browser.
 * Code is from: notjuliet at
 * https://github.com/notjuliet/pdsls/blob/74d45a3a56149d706fe950e2a7123a526d4ac5cf/src/views/record.tsx#L146-L197
 * @param postUri The URI to create a HTTP/web link for.
 * @param handle Optional: The handle of the User associated with the link. Used to make the link more readable.
 * @returns URL string to URI content.
 */
export function CreateBskyWeblink(postUri:string, handle:string=""):string|undefined{
    //Should be moved somewhere else
    type AtUri = { repo: string; collection: string; rkey: string };
    type TemplateFn = (uri: AtUri) => { label: string; link: string };
    type TemplateMap = Record<string, TemplateFn>;

    const uriTemplates: TemplateMap = {
        "app.bsky.actor.profile": (uri) => ({
        label: "Bluesky",
        link: `https://bsky.app/profile/${uri.repo}`,
        }),
        "app.bsky.feed.post": (uri) => ({
        label: "Bluesky",
        link: `https://bsky.app/profile/${handle.trim()!='' ? handle : uri.repo}/post/${uri.rkey}`,
        }),
        "app.bsky.graph.list": (uri) => ({
        label: "Bluesky",
        link: `https://bsky.app/profile/${uri.repo}/lists/${uri.rkey}`,
        }),
        "app.bsky.feed.generator": (uri) => ({
        label: "Bluesky",
        link: `https://bsky.app/profile/${uri.repo}/feed/${uri.rkey}`,
        }),
    };
    const uriParts = postUri.split('\/'); //expecting: ["at:", "", "repo", "collection", "rkey"]
    if (uriParts.length != 5) return undefined;
    if (uriParts[0] !== "at:" || uriParts[1] !== "") return undefined;
    const parsedUri: AtUri = {
        repo: uriParts[2],
        collection: uriParts[3],
        rkey: uriParts[4],
    };
    const template = uriTemplates[parsedUri.collection];
    if (!template) return undefined;
    return template(parsedUri).link;
}