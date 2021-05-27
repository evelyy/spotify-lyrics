const axios = require('axios');
const cio = require('cheerio');

const searchURL = 'https://api.genius.com/search?q=';

const checkConfig = (config) => {
    let { apiKey, title, artist } = config;
    switch ('undefined') {
        case typeof apiKey:
            throw 'apiKey in options';
        case typeof title:
            throw 'title not in options';
        case typeof artist:
            throw 'artist not in options';
        default:
            break;
    }
};

const getTitle = (title, artist) => {
	return `${title} ${artist}`
		.toLowerCase()
		.replace(/ *\([^)]*\) */g, '')
		.replace(/ *\[[^\]]*]/, '')
		.replace(/feat.|ft./g, '')
		.replace(/\s+/g, ' ')
		.trim();
};

async function searchSong (config) {
    // config should have been validated before being passed here so its fiiine
    try {
        let { apiKey, title, artist } = config;
        const song = getTitle(title, artist);
        const reqURL = `${searchURL}${encodeURIComponent(song)}`;
        const headers = {
            Authorization: `Bearer  ${apiKey}`
        };
        let { data } = await axios.get(reqURL, { headers });
        if (data.response.hits.length ===  0)
            return null;
        const results = data.response.hits.map((val) => {
            const { full_title, id, url } = val.result;
            return { id, title: full_title, url };
        });
        return results;
    } catch (e) {
        throw e;
    }
}
async function getSong(config) {
    try {
        checkConfig(config);
        let results =  await searchSong(config);
        if (!results)
            return null;
        let lyrics = await extractLyrics(results[0].url);
        return lyrics
    } catch (e) {
        throw e;
    }
}

async function extractLyrics(url) {
    try {
        let { data } = await axios.get(url);
        const $ =  cio.load(data);
        let lyrics = $('div[class="lyrics"]').text().trim();
        if (!lyrics) {
            lyrics = '';
            $('div[class^="Lyrics__Container"]').each((i, elem) => {
				if($(elem).text().length !== 0) {
					let snippet = $(elem).html()
					.replace(/<br>/g, '\n')
					.replace(/<(?!\s*br\s*\/?)[^>]+>/gi, '');
					lyrics += $('<textarea/>').html(snippet).text().trim() + '\n\n';
                }
            })
        }
        if (!lyrics) return null;
		return lyrics.trim();
    } catch (e) {
        throw e;
    }
}


module.exports = async (config) => {
    let lyrics = getSong(config);
    return lyrics;
}

