import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.sqlite');

db.all("PRAGMA table_info(document_categories);", (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log("COLUMNS:", JSON.stringify(rows, null, 2));
    }

    db.all("SELECT * FROM document_categories LIMIT 3;", (err2, rows2) => {
        if (err2) console.error(err2);
        else console.log("DATA:", JSON.stringify(rows2, null, 2));
        db.close();
    });
});
