import { DetailIcon } from "../components/Post/PostInterfaces";
import { PostEnums } from "../enums/PostEnums";

//Icons
import SolarChatDotsOutline from '~icons/solar/chat-dots-outline';
import MingcuteRepeatLine from '~icons/mingcute/repeat-line';
import MingcuteHeartFill from '~icons/mingcute/heart-fill';
import SolarShareBold from '~icons/solar/share-bold';
import MdiDotsHorizontal from '~icons/mdi/dots-horizontal';

/**In a real situation, the label values should be set when the modal is created
 * using the post data returned from the server.
 */
var DetailIconList : DetailIcon[] = [
    { label: '6', type:PostEnums.IconTypes.Comment, icon: SolarChatDotsOutline, color: 'group-hover:text-yellow-500' },
    { label: '2', type:PostEnums.IconTypes.Reposts, icon: MingcuteRepeatLine, color: 'group-hover:text-blue-500' },
    { label: '3', type:PostEnums.IconTypes.Likes, icon: MingcuteHeartFill, color: 'group-hover:text-red-500' },
    { label: '', type:PostEnums.IconTypes.Share, icon: SolarShareBold, color: 'group-hover:text-blue-500' },
    { label: '', type:PostEnums.IconTypes.Options, icon: MdiDotsHorizontal, color: 'group-hover:text-white-500' },
]

export { DetailIconList }