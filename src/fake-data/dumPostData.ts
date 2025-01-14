import { IDetailIcon, IOptionIcon } from "../interfaces/PostInterfaces";
import { PostEnums } from "../enums/PostEnums";

//DetailIcon Icons
import SolarChatDotsOutline from '~icons/solar/chat-dots-outline';
import MingcuteRepeatLine from '~icons/mingcute/repeat-line';
import MingcuteHeartFill from '~icons/mingcute/heart-fill';
import SolarShareBold from '~icons/solar/share-bold';
import MdiDotsHorizontal from '~icons/mdi/dots-horizontal';

/**In a real situation, the label values should be set when the modal is created
 * using the post data returned from the server.
 */
var DetailIconList : IDetailIcon[] = [
    { label: '6', type:PostEnums.IconTypes.Comment, icon: SolarChatDotsOutline, color: 'group-hover:text-yellow-500' },
    { label: '2', type:PostEnums.IconTypes.Reposts, icon: MingcuteRepeatLine, color: 'group-hover:text-blue-500' },
    { label: '3', type:PostEnums.IconTypes.Likes, icon: MingcuteHeartFill, color: 'group-hover:text-red-500' },
    { label: '', type:PostEnums.IconTypes.Share, icon: SolarShareBold, color: 'group-hover:text-blue-500' },
    { label: '', type:PostEnums.IconTypes.Options, icon: MdiDotsHorizontal, color: 'group-hover:text-white-500' },
]

//PostOptionMenu Icons
import MdiTranslateVariant from '~icons/mdi/translate-variant';
import MdiClipboard from '~icons/mdi/clipboard';
import MdiCode from '~icons/mdi/code';
import MingcuteVolumeMuteFill from '~icons/mingcute/volume-mute-fill';
import MdiHideOutline from '~icons/mdi/hide-outline';
import MdiBlock from '~icons/mdi/block';

/**
 * Collection of all the options to display on the
 * `PostOptionsMenu` component.
 */
const OptionIconList : IOptionIcon[][] = [
    [
        { name:'Translate', icon:MdiTranslateVariant },
        { name:'Copy link', icon:MdiClipboard },
        { name:'Embed', icon:MdiCode },
    ],
    [
        { name:'Mute', icon: MingcuteVolumeMuteFill }
    ],
    [
        { name:'Hide', icon: MdiHideOutline }
    ],
    [
        { name:'Block', icon: MdiBlock }
    ]
]

export { DetailIconList, OptionIconList }