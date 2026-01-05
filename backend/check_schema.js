require('dotenv').config();
const supabase = require('./database/supabaseClient');

async function checkColumn(colName) {
    const { error } = await supabase
        .from('products')
        .select(colName)
        .limit(1);

    if (error) {
        console.log(`[ ] ${colName} MISSING`);
    } else {
        console.log(`[X] ${colName} FOUND`);
    }
}

async function checkSchema() {
    console.log("Final Schema Verification:");
    await checkColumn('name');
    await checkColumn('price');
}

checkSchema();
