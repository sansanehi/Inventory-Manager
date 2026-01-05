require('dotenv').config();
const supabase = require('./database/supabaseClient');

async function checkOrdersSchema() {
    console.log("Checking orders table...");
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .limit(1);

    if (error) {
        console.log("Error querying orders:", error.message);
    } else {
        console.log("Orders table accessed successfully.");
        if (data.length > 0) {
            console.log("Sample order keys:", Object.keys(data[0]));
        } else {
            console.log("Orders table is empty.");
        }
    }
}

checkOrdersSchema();
