require('dotenv').config();
const supabase = require('./database/supabaseClient');

async function checkTables() {
    console.log("Checking for miscellaneous tables...");

    const tables = ['transactions', 'inventory_logs', 'logs', 'supply'];

    for (const table of tables) {
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.log(`Table '${table}' check failed: ${error.message} (likely does not exist)`);
        } else {
            console.log(`Table '${table}' EXISTS. Count: ${count}`);
        }
    }
}

checkTables();
