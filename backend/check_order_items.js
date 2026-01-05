require('dotenv').config();
const supabase = require('./database/supabaseClient');

async function checkOrderItemsSchema() {
    console.log("Checking order_items table...");
    const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .limit(1);

    if (error) {
        console.log("Error querying order_items:", error.message);
    } else {
        console.log("order_items table accessed successfully.");
    }
}

checkOrderItemsSchema();
