require('dotenv').config();

// Imports dependencies and set up http server
const express = require('express');
const body_parser = require('body-parser');
const axios = require("axios");

const { getLastPublishedAt, saveLastPublishedDate}  = require("./utils/supabase");
const { sendTelegramMessage } = require("./utils/telegram");

const app = express().use(body_parser.json()); // creates express http server

const fetchJobs = async () => {
    const url = process.env.JOBS_API_URL;
    const response = await axios.get(url);
    return response.data.data
};


const sendNewJobs = async () => {

    const lastEntryPublishedDate = await getLastPublishedAt();

    const jobs = await fetchJobs();
    const newJobs = jobs.filter(job => new Date(job.published_at) > new Date(lastEntryPublishedDate));


    if (newJobs.length > 0) {
        for (const job of newJobs) {
            await sendTelegramMessage(`New job posted: ${job.title} - ${job.link}`);
        }

        await saveLastPublishedDate(jobs[0]);
        return 'OK - new jobs sent'
    }

    return 'No new jobs'
}

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening', process.env.PORT || 1337));

app.get('/main', async (req, res) =>{
    try {
        const response = await sendNewJobs(req, res);
        res.send(response);
    } catch (error) {
        await sendTelegramMessage("Bot is down");
    } finally {
        res.end();
    }
});

// health check endpoint
app.get("/health", async(req, res) => {
    res.send("OK");
});