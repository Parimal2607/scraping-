const puppeteer = require("puppeteer");
const fs = require("fs"); // Import fs package
const { v4: uuidv4 } = require("uuid"); // Import uuid package

async function scrapeAllPages() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const url = "https://www.coindesk.com/";
  let articlesData = [];

  // Function to scrape a single page
  async function scrapePage(url) {
    await page.goto(url, { timeout: 0 });

    // Extract articles data from the list page
    let pageData = await page.evaluate(() => {
      let articles = [];
      document.querySelectorAll(".card-category-wrapper").forEach((article) => {
        let link = article.querySelector(".card-category-cover>a")?.href;
        let img = article.querySelector(".card-category-cover>a>picture>img")?.src;
        let title = article.querySelector(".card-category-data>a>.card-title>h3")?.textContent.trim();
        let subTitle = article.querySelector(".card-category-data>div>a")?.textContent.trim();
        let date = article.querySelector(".card-category-data>div>div>span")?.textContent.trim();
        let description = article.querySelector(".card-category-data>div>p")?.textContent.trim();

        articles.push({
          title: title || "No title",
          subTitle: subTitle || "No sub title",
          img: img || "No image",
          link: link || "No link",
          date: date || "No date",
          description: description || "No data",
        });
      });
      return articles;
    }).catch((err) => {
      console.error("Error in page.evaluate:", err);
      return [];
    });

    // Check if pageData is defined and is an array
    if (Array.isArray(pageData)) {
      // Add UUIDs in Node.js context
      pageData = pageData.map((article) => ({
        id: uuidv4(),
        ...article,
      }));
    } else {
      pageData = []; // Set to empty array if undefined
    }

    return pageData;
  }

  // Scrape the given URL
  articlesData = await scrapePage(url);

  // Log the collected articles data
  console.log("Scraped Articles Data:", articlesData);

  // Save the data to a JSON file
  fs.writeFileSync('coinDeskParent.json', JSON.stringify(articlesData, null, 2), 'utf-8');
  console.log("Data has been saved to coinDeskParent.json");

  await browser.close();
}

scrapeAllPages();
