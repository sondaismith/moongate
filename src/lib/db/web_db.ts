import Dexie, {type EntityTable} from 'dexie';

interface Feed{
    id: number;
    data: string;
}

interface AppSettings{ //extends IAppSettings{
  id: number;
  isDarkMode: boolean;
  isAcceptingAllLanguages: boolean;
  isWhitelist: boolean;
  isBlacklist: boolean;
  selectedLanguages: string //have to convert from LangCode[] to string
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