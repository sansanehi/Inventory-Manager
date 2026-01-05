require('dotenv').config();
const supabase = require('./database/supabaseClient');

async function checkRpc() {
    console.log("Attempting SQL execution via RPC...");

    try {
        const { data, error } = await supabase.rpc('exec_sql', {
            sql_query: "create table if not exists public.test_table (id serial primary key);"
        });

        if (error) {
            console.log("RPC 'exec_sql' failed:", error.message);
        } else {
            console.log("RPC 'exec_sql' SUCCESS!");
        }
    } catch (e) {
        console.log("RPC Execution Error:", e.message);
    }
}

checkRpc();
