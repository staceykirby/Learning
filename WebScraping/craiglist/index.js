const request = require('request-promise');
const cheerio = require('cheerio');

const url = 'https://sfbay.craigslist.org/search/sof';

const scrapeResult = {
    title: 'Technical Autonomous Vehicle Trainer',
    description: 'Long text about the job .. requirement ect',
    datePosted : new Date('2018=07-13'),
    url : 'https://sfbay.craigslist.org/sfc/sof/d/mobile-ios-software-engineer/6762516965.html',
    hood:'(SOMA / south beach)',
    address:'1201 Bryant St.',
    compensation:'23/hr'

};
const scrapeResults = [];
async function scrapeJobHeader(){
    try{
        const htmlResult = await request.get(url);
        const $ = await cheerio.load(htmlResult);
        $(".result-info").each((index,element) =>{
            const resultTitle = $(element).children(".result-title");
            const title = resultTitle.text();
            const url = resultTitle.attr("href");
            const datePosted = new Date($(element).children("time").attr("datetime"));
            const hood = $(element).find(".result-hood").text();
            const scrapeResult = {title,url,datePosted, hood}; 
            scrapeResults.push(scrapeResult);     
        });
        return scrapeResults;
    } catch(err){
        console.error(err);
    }
}
async function scrapeDescription(jobsWithHeaders){
    return await Promise.all(
        jobsWithHeaders.map(async(job) => {
        const htmlResult = await request.get(job.url);
        const $ = await cheerio.load(htmlResult);
        $(".print-qrcode-container").remove();
        job.description = $("#postingbody").text();
        job.address = $("div.mapaddress").text();
        let compensation = $(".attrgroup").children().first().text();
        job.compensation = compensation.replace('compensation: ', "");
        return job;
        })
    );
}
async function scrapeCraigslist(){
    const jobsWithHeaders = await scrapeJobHeader();
    const jobsFullData = await scrapeDescription(jobsWithHeaders);
    console.log(jobsFullData);
}

scrapeCraigslist();