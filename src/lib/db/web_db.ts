import Dexie, {type EntityTable} from 'dexie';
import { IAppSettings } from '../../interfaces/SettingsInterfaces';

interface Feed{
    id: number;
    data: string;
}

/**
 * Based on {@link IAppSettings}. Currently does not extend because
 * of a "LangCode[] to string" conversion issue.
 */
interface AppSettings{ //extends IAppSettings{
  id: number;
  isDarkMode: boolean;
  isAcceptingAllLanguages: boolean;
  isWhitelist: boolean;
  isBlacklist: boolean;
  selectedLanguages: string //have to convert from LangCode[] to string
  isShowingIntroMessage: boolean;
  isHidingComments: boolean;
  isHidingShares: boolean;
  isHidingLikes: boolean;
  isHidingFollowers: boolean;
  isHidingFollowing: boolean;
  savedAccountState:string //have to convert from IAppAccountState to string;
}

/**IndexedDB database with `savedFeeds` store/table.*/
const web_db = new Dexie('moongateData') as Dexie & {
  savedFeeds: EntityTable<
    Feed,
    'id' // primary key "id" (for the typings only)
  >;
  appSettings: EntityTable<
    AppSettings,
    'id'
  >;
};

web_db.version(1).stores({
  savedFeeds: '++id, data', // primary key "id" (for the runtime!)
  appSettings: '++id'
});

export type {Feed, AppSettings as WebDBAppSettings};
export {web_db};