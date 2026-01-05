require('dotenv').config();
const supabase = require('./database/supabaseClient');

async function checkCounts() {
    console.log("Checking table counts...");

    const { count: customerCount, error: customerError } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

    if (customerError) console.log("Error checking customers:", customerError.message);
    else console.log(`Customers count: ${customerCount}`);

    const { count: productCount, error: productError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

    if (productError) console.log("Error checking products:", productError.message);
    else console.log(`Products count: ${productCount}`);
}

checkCounts();
