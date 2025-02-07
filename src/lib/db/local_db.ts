import Database from "@tauri-apps/plugin-sql";

export async function createTestTable(){
    const db = await Database.load('sqlite:prefs_test.db');
    var result;
    try{
        result = await db.execute('CREATE TABLE dummy (id INTEGER PRIMARY KEY, title TEXT,created_at datetime DEFAULT "now")');
    }
    catch(error){
        console.log(error);
        result = undefined;
    }
    return result;
}

export async function addTestRecord(){
    const db = await Database.load('sqlite:prefs_test.db');
    var result = await db.execute('INSERT into dummy (title, created_at) VALUES ($1,$2)',
        ['test', new Date().toISOString()]
    )
    return result;
}

export async function loadRecords(){
    const db = await Database.load('sqlite:prefs_test.db');
    var result = await db.select('SELECT * FROM dummy');
    return result;
}
