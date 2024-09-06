const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const fs = require("fs");
const { v4: uuidv4 } = require("uuid"); // Import uuid package

async function scrapeAllPages() {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  const page = await browser.newPage();

  let currentPage = 1;
  let articlesData = [];

  // Function to scrape a single page
  async function scrapePage(url) {
    await page.goto(url, { timeout: 0 });
    // Extract articles data from the list page
    let pageData = await page.evaluate(() => {
      let articles = [];
      document
        .querySelectorAll("[data-el='bic-c-news-big']")
        .forEach((article) => {
          let link = article.querySelector("a")?.href;
          let img = article.querySelector("img")?.srcset;
          let title = article.querySelector("h5 a")?.textContent.trim();
          let category = article
            .querySelector("a>span")
            ?.textContent.trim(); // Updated to target the first category link
          let date = article.querySelector("time.ago")?.textContent.trim(); // Updated to target the date in the 'time.ago' element

          articles.push({
            title: title || "No title",
            link: link || "No link",
            img: img || "No img",
            category: category || "No category",
            date: date || "No data",
          });
        });
      return articles;
    });

    // Add UUIDs in Node.js context
    pageData = pageData.map((article) => ({
      ...article,
    }));

    return pageData;
  }

  // Loop to go through each page
  const url = "https://beincrypto.com/news/";
  let pageData = await scrapePage(url);

  // Check if the first page has any articles
  if (pageData.length === 0) {
    console.log("No articles found on the first page.");
  } else {
    console.log("Articles found on the first page:", pageData);
  }

  // If needed, you can store the data for further testing

  console.log(pageData);
  // Save the data to a JSON file
  //   fs.writeFile(
  //     "beincrypto.json",
  //     JSON.stringify(articlesData, null, 2),
  //     (err) => {
  //       if (err) {
  //         console.error("Failed to write to file:", err);
  //       } else {
  //         console.log("Data successfully saved to scrapedData.json");
  //       }
  //     }
  //   );

  //   await browser.close();
}

scrapeAllPages();
