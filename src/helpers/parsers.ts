
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
export function GenerateTagLinkText(text:string|undefined){
    if(text == undefined) return;
    var result;
    var html = `${text}`;
    //Check for tags first
    var tagResults = GetHashtagPositions(text);
    tagResults.forEach(element => {
        html = html.replace(element.foundTag,`<component :is="Hashtag" :tagValue="'${element.foundTag}'">${element.foundTag}</component>`)
    });
    //Check for User links next
    var userlinkResults = GetUserlinkPositions(text);
    userlinkResults.forEach(element => {
        html = html.replace(element.foundUserlink,`<component :is="Userlink" :userlinkValue="'${element.foundUserlink}'">${element.foundUserlink}</component>`)
    });
    //At end, replace all newlines (\n) with line-breaks
    html = html.replace(/\n/g,"<br/>");
    result = html;
    //Return formatted "text component"
    return result;
}

/**
 * Method that searches a provided text string and returns the
 * starting positions of hashtags along with the hashtags themselves.
 * @param text The text to search for the Hashtag positions.
 * @returns Array containing results.
 */
export function GetHashtagPositions(text:string){
    var result = [];
    let matches = text.matchAll(tagRegex);
    for(const match of matches){
        result.push({foundIndex: match.index, foundTag: match[0]});
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
export function GetUserlinkPositions(text:string){
    var result = [];
    let matches = text.matchAll(userlinkRegex);
    for(const match of matches){
        result.push({foundIndex: match.index, foundUserlink: match[0]});
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
