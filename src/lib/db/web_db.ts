import Dexie, {type EntityTable} from 'dexie';

interface Feed{
    id: number;
    data: string;
}

/**IndexedDB database with `savedFeeds` store/table.*/
const web_db = new Dexie('moongateData') as Dexie & {
  savedFeeds: EntityTable<
    Feed,
    'id' // primary key "id" (for the typings only)
  >;
};

web_db.version(1).stores({
  savedFeeds: '++id, data', // primary key "id" (for the runtime!)
});

export type {Feed};
export {web_db};