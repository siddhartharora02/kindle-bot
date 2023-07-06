const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const saveLastPublishedDate = async (lastEntry) => {
    const { data, error } = await supabase
        .from('jobs')
        .insert([
            {
                published_date: lastEntry.published_at,
            }
        ]);

    if (error) console.log('Error inserting data:', error);
    else console.log('Response saved:', data);

    return data;
}


const getLastPublishedAt = async () => {
    // there is only 1 row in this table
    const { data, error } = await supabase
        .from('jobs')
        .select('published_date')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) console.log('Error getting last published at:', error);
    else console.log('Last published at:', data);

    if (data.length === 0) return null;
    return data[0].published_date;
}

module.exports = {
    saveLastPublishedDate,
    getLastPublishedAt
}