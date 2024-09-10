const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const fs = require("fs"); // Import fs package

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

// due to security issue

async function scrapeAllPages() {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  const page = await browser.newPage();
  const url = "https://www.forbes.com/digital-assets/news";
  let articlesData = [];

  async function scrapePage(url) {
    await page.goto(url, { timeout: 0 });
    let originalOffset = 0;
    while (true) {
      console.log("hello")
      await page.evaluate("window.scrollBy(0, document.body.scrollHeight)");
      let newOffset = await page.evaluate("window.pageYOffset");
      if (originalOffset === newOffset) {
        break;
      }
      originalOffset = newOffset;
    }
    // Wait for the "Load More" button to appear
    let hrefElement = await page.$("[data-testid='variants']");

    let count = 0;

    while (hrefElement) {
      await delay(1000);
      count++;
      console.log("count: ", count);
      // Wait for the button to be clickable
      await page.waitForSelector("[data-testid='variants']", {
        visible: true,
      });

      // Click the button
      await page.click("[data-testid='variants']");

      // Scroll again after clicking load more
      originalOffset = 0;
      while (true) {
        await page.evaluate("window.scrollBy(0, document.body.scrollHeight)");
        let newOffset = await page.evaluate("window.pageYOffset");
        if (originalOffset === newOffset) {
          break;
        }
        originalOffset = newOffset;
      }

      // Check if the load more button still exists after loading more articles
      hrefElement = await page.$("[data-testid='variants']");

      if (count > 1) break;

      if (!hrefElement) break;
    }
    // Extract articles data from the list page
    let pageData = await page
      .evaluate(() => {
        let articles = [];
        console.log("object");
        document
          .querySelectorAll("[class^='StreamFeed_streamCard']")
          .forEach((article) => {
            let linkElement = article.querySelector("div>div:nth-child(1)>a");
            let imgElement = article.querySelector("div>div:nth-child(1)>a>img");
            let dateElement = article.querySelector(
              "div>div:nth-child(2)>div:nth-child(1)>span"
            );
            let authorElement = article.querySelector(
              "div>div:nth-child(2)>div:nth-child(2)>a"
            );
            let titleElement = article.querySelector("div>div:nth-child(2)>h3>a");
            let descriptionElement =
              article.querySelector("div:nth-child(2)>p");

            let link = linkElement ? linkElement.getAttribute("href") : null;
            let img = imgElement ? imgElement.getAttribute("src") : null;
            let title = titleElement ? titleElement.textContent.trim() : null;
            let date = dateElement ? dateElement.textContent.trim() : null;
            let autore = authorElement
              ? authorElement.textContent.trim()
              : null;

            let description = descriptionElement
              ? descriptionElement.textContent.trim()
              : null;

            articles.push({
              title: title || "No title",
              date: date || "No date",
              autore: autore || "No autore",
              img: `https://news.mit.edu/${img}` || "No image",
              link: link ? `https://news.mit.edu/${link}` : "No link",
              description: description || "No description",
            });
          });
        return articles;
      })
      .catch((err) => {
        console.error("Error in page.evaluate:", err);
        return [];
      });

    return pageData;
  }

  // Scrape the given URL
  articlesData = await scrapePage(url);

  // Log the collected articles data
  console.log("Scraped Articles Data:", articlesData);

  // Uncomment these lines to save the data to a JSON file
  //   fs.writeFileSync(
  //     "mitNews.json",
  //     JSON.stringify(articlesData, null, 2),
  //     "utf-8"
  //   );
  console.log("Data has been saved to mitNews.json");

  //   await browser.close();
}

scrapeAllPages();
