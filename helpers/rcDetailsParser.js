// const puppeteer = require('puppeteer');
const chromium = require('chrome-aws-lambda');
const BASE_URL = "https://vahan.nic.in/nrservices/faces/user/searchstatus.xhtml";

function evaluateCaptchaValue(captchaText) {
	console.log("captcha text: ", captchaText);

	let numbers = captchaText.match(/\d+/g).map(Number);
	console.log(numbers);

	if(captchaText.indexOf('-') != -1) {
		return numbers[0] - numbers[1];
	} else if(captchaText.indexOf('+') != -1) {
		return numbers[0] + numbers[1];
	} else if(captchaText.indexOf('*') != -1) {
		return numbers[0] * numbers[1];
	} else if(captchaText.indexOf('greater') != -1) {
		return Math.max(...numbers);
	} else if(captchaText.indexOf('lesser') != -1) {
		return Math.min(...numbers);
	} else {
		return numbers[0];
	}
}

async function scrapRc(license) {
	const browser = await chromium.puppeteer.launch({
        executablePath: await chromium.executablePath,
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        headless: true,
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0); 
	await page.goto(BASE_URL);

	await page.waitForSelector('div#page-wrapper');

	let captchaText = await page.$eval('#capatcha > label', val => val.innerHTML);
	// console.log("captcha text: ", captchaText);

	let solvedCaptcha = evaluateCaptchaValue(captchaText);

	console.log("solved captcha = ", solvedCaptcha.toString());

	await page.type('#regn_no1_exact', license);
  	await page.type('#txt_ALPHA_NUMERIC', solvedCaptcha.toString());

  	await page.keyboard.press('Enter');


  	await page.waitForSelector('#rcDetailsPanel');

  	let data = await page.$$eval('#rcDetailsPanel div.row div', vals => vals.map(val => val.textContent));
  	data = data.map(el => el.trim());

  	let regAuthority = data[3];

  	let rcDetails = {};
  	rcDetails["registering_authority"] = regAuthority.slice(2+regAuthority.indexOf(': '));

  	data = data.slice(4);

  	for(let i = 0; i < data.length; i+=2) {
  		let fields = (data[i].toLowerCase()).split(' ');
  		field = fields.join('_');
  		rcDetails[field] = data[i+1];
  	}
  	// console.log(data);
  	console.log(rcDetails);

  	// await page.screenshot({path: 'rc.png', fullPage: true});

	return rcDetails;

}

async function scrapTikTokUser(username) {
	const profileUrl = BASE_URL + username;
	// const browser = await puppeteer.launch({ headless: true });
	const browser = await chromium.puppeteer.launch({
        executablePath: await chromium.executablePath,
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        headless: true,
    });
	const page = await browser.newPage();
	await page.goto(profileUrl);
	await page.waitForSelector('#__NEXT_DATA__');
	const bodyHandle = await page.$('#__NEXT_DATA__');
	const html = JSON.parse(await page.evaluate(body => body.innerHTML, bodyHandle));
	await browser.close();
	return html;
}

module.exports = {
	scrapRc
}