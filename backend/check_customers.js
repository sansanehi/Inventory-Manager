require('dotenv').config();
const supabase = require('./database/supabaseClient');

async function checkCustomersSchema() {
    console.log("Checking customers table...");
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .limit(1);

    if (error) {
        console.log("Error querying customers:", error.message);
    } else {
        console.log("customers table accessed successfully.");
    }
}

checkCustomersSchema();
