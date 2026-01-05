require('dotenv').config();
const supabase = require('./database/supabaseClient');

async function verifyOrders() {
    console.log("Verifying orders table...");
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .limit(1);

    if (error) {
        console.log("VERIFICATION RESULT: FAILURE");
        console.log("Error accessing orders table:", error.message);
        if (error.code === 'PGRST205') {
            console.log("confirmed: Table 'public.orders' does not exist.");
        }
    } else {
        console.log("VERIFICATION RESULT: SUCCESS");
        console.log("Orders table exists.");
    }
}

verifyOrders();
