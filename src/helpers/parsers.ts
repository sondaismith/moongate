
const tagRegex = new RegExp(`${/#\S*/.source}`,'g');
// const tagRegex = new RegExp(`${/\B#\w+/.source}`,'g');
const userlinkRegex = new RegExp(`${/\B@(\S*)/.source}`,'g');

/**
 * Method that parses a passed in string for hashtags (words beginning with #)
 * or userlinks (words beginning with \@) and returns a modified version of
 * that string with components elements added describing those special pieces
 * of text.
 * @param text The text to scan for hashtags or userlinks.
 * @returns Text string with added hashtag/userlink component declaration.
 */
export function GenerateTagLinkText(text:string|undefined, hashTagStyle:string|undefined = undefined,
    userLinkStyle:string|undefined = undefined){
    if(text == undefined) return;
    var result;
    var html = `${text}`;
    var hashStyle = '';
    var ulStyle = '';
    if(hashTagStyle) hashStyle = hashTagStyle;
    if(userLinkStyle) ulStyle = userLinkStyle;
    //Check for tags first
    var tagResults = GetHashtagPositions(text);
    //Create regex to split post text into sections using found tags
    // var tagSplitGroup = '';
    // for (let i = 0; i < tagResults.length; i++) {
    //     tagSplitGroup += tagResults[i].foundTag;
    //     if(i+1<tagResults.length) tagSplitGroup+='|';
    // }
    // var tagSplitRegex = new RegExp(/#gaming/,'g');
    // //Split Post text
    // var splitPostText = text.split(tagSplitRegex);
    // tagResults.forEach(element => {
    //     html = html.replace(element.foundTag,`<component :is="Hashtag" :tagValue="'${element.foundTag}'" :class="'${hashStyle}'">${element.foundTag}</component>`)
    // });
    //Check for User links next
    var userlinkResults = GetUserlinkPositions(text);
    //Combine hashtag and userlink info
    var combinedResults = tagResults.concat(userlinkResults)
    //Sort combined info by foundIndex, highest value first
    combinedResults.sort((a,b) => b.foundIndex - a.foundIndex)
    //Slice Post text into array of text and each hashtag and userlink
    for (let i = 0; i < combinedResults.length; i++) {
        var componentDef = '';
        if(combinedResults[i].type == 'hashtag'){componentDef = `<component :is="Hashtag" :tagValue="'${combinedResults[i].foundValue}'" :class="'${ulStyle}'">${combinedResults[i].foundValue}</component>`;}
        else if(combinedResults[i].type == 'userlink'){componentDef = `<component :is="Userlink" :userlinkValue="'${combinedResults[i].foundValue}'" :class="'${ulStyle}'">${combinedResults[i].foundValue}</component>`;}
        html = html.substring(0,combinedResults[i].foundIndex) + componentDef + html.substring(combinedResults[i].foundIndex+combinedResults[i].foundValue.length,html.length);
    }
    userlinkResults.forEach(element => {
        html = html.replace(element.foundUserlink,`<component :is="Userlink" :userlinkValue="'${element.foundUserlink}'" :class="'${ulStyle}'">${element.foundUserlink}</component>`)
    });
    //At end, replace all newlines (\n) with line-breaks
    html = html.replace(/\n/g,"<br/>");
    result = html;
    //Return formatted "text component"
    return result;
}

interface IParseResults{
    foundIndex: number,
    foundValue: string,
    type: string,
}

/**
 * Method that searches a provided text string and returns the
 * starting positions of hashtags along with the hashtags themselves.
 * @param text The text to search for the Hashtag positions.
 * @returns Array containing results.
 */
export function GetHashtagPositions(text:string):IParseResults[]{
    var result = [];
    let matches = text.matchAll(tagRegex);
    for(const match of matches){
        result.push({foundIndex: match.index, foundValue: match[0], type:'hashtag'});
    }
    return result;
}

/**
 * Method that searches a provided text string and returns the
 * starting positions of user links along with the user links
 * themselves.
 * @param text The text to search for the User link positions.
 * @returns Array containing results.
 */
export function GetUserlinkPositions(text:string):IParseResults[]{
    var result = [];
    let matches = text.matchAll(userlinkRegex);
    for(const match of matches){
        result.push({foundIndex: match.index, foundValue: match[0], type:'userlink'});
    }
    return result;
}

/**
 * Method that parses a text string and looks to see if it contains
 * any hashtags - any words begining with (#).
 * @param text The text to parse for hashtags.
 * @returns Boolean value indicating if any hashtags were found.
 */
export function CheckForHashtags(text:string){
    var result = false;
    result = tagRegex.test(text);
    return result;
}

/**
 * Method that parses a text string and looks to see if it contains
 * any user links - any words begining with (@).
 * @param text The text to parse for user links.
 * @returns Boolean value indicating if any user links were found.
 */
export function CheckForUserLinks(text:string){
    var result = false;
    result = userlinkRegex.test(text);
    return result;
}
