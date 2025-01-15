import { PostTypes } from '../enums/PostEnums';
import {IPostDetails} from '../interfaces/PostInterfaces';

export function createPost(maxNumComments : number):IPostDetails{
    var numReposts = Math.floor(Math.random()*31);
    var numLikes = Math.floor(Math.random()*101);
    var numComments = Math.floor(Math.random()*maxNumComments);
    var postComments : IPostDetails[] = [];
    var contentType = returnPartialPostType();

    if(numComments>0)
    {
        for (let num = 0; num < numComments; num++) {
            //Make all comments not have replies for now
            postComments.push(createPost(0));
        }
    }

    var newPost : IPostDetails = {
        userName: createName(),
        userHandle: createHandle(),
        totalReposts: numReposts,
        totalLikes: numLikes,
        postText: 'test',
        postType: returnPartialPostType(),
        comments: postComments,
        totalComments: postComments.length
    }

    if(newPost.postType == PostTypes.Image){
        newPost.postMedia = getImageUrl(getRandomImageNum());
    }

    return newPost;
}

var partialPostTypes = [PostTypes.Text, PostTypes.Image];
function returnPartialPostType():PostTypes{
    return partialPostTypes[Math.floor(Math.random() * partialPostTypes.length)];
}

//From https://stackoverflow.com/a/71407276
function getRandomEnumValue<T extends object>(anEnum: T): T[keyof T] {
    //save enums inside array
    const enumValues = Object.keys(anEnum) as Array<keyof T>;

    //Generate a random index (max is array length)
    const randomIndex = Math.floor(Math.random() * enumValues.length);
    // get the random enum value

    const randomEnumKey = enumValues[randomIndex];
    return anEnum[randomEnumKey];
   // if you want to have the key than return randomEnumKey
}

function createName():String{
    var newName = names[Math.floor(Math.random()*names.length)];
    return newName;
}

function createHandle():String{
    var n1 = handles[Math.floor(Math.random()*handles.length)];
    var n2 = handles[Math.floor(Math.random()*handles.length)];
    return n1+n2;
}

var names : string[] = [
    "Bob","Sam","James","Sunny","Alice","Jessica",
    "Helen","Kumiko","Astrid","Max","Lewis","Charles",
    "Renard","Marida","Asuka","Travis","Shinichi","John",
    "West","Miya","Coach","Jensen"
]

var handles : string[] = [
    "Flock","Crazy","Jump","Grill","Fly","Jostle","Film",
    "Jam","Drill","Silly","Watch","Sing","Spy","Pilot"
]

function getImageUrl(num:String){
    // var iNum = getRandomImageNum();
    return new URL(`../assets/test-media/posts/image${num}.png`, import.meta.url).href;
}

function getRandomImageNum(){
    var imageNum = (Math.floor(Math.random()*8)+1);
    console.log(imageNum);
    return "0"+imageNum;
}