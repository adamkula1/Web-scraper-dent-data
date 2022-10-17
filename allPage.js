const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const xlsx = require("xlsx");

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      slowMo: 1000,
      devtools: true,
    });
    const page = await browser.newPage();
    await page.goto("https://www.dent.cz/zubni-lekari");
    await page.waitForSelector(".cross-cross-dentists-list");

    let pagesToScrape = 233;
    let currentPage = 1;
    let data = [];

    while (currentPage <= pagesToScrape) {
      //Pagination (1 to 233)
      if (currentPage < pagesToScrape) {
        await page.click(".box-pager__btn--next");
        await page.waitForSelector(".cross-cross-dentists-list");
      }
      currentPage++;

      //Scrape data
      const scrapContainer = await page.evaluate(() => {
        // debugger;

        //Select all boxes
        const wrapList = document.querySelectorAll(
          ".u-mb-lg .cross-cross-dentists-list .row .cross-dentists-list__item"
        );

        //Save data from wrapList
        let listArr = [];

        wrapList.forEach((item) => {
          //Name ambulance
          let listName = item.querySelector("h3 a");
          //Select all p element (2x)
          let listParagraph = item.querySelectorAll("p");
          //Select first p element
          let actualAddress = listParagraph[0];

          //Select strong(2x) tag (child) from actualAddress (parent) element
          let listStrong = actualAddress.querySelectorAll("strong");
          let actualPhone = listStrong[0];
          let actualEmail = listStrong[1];

          //Push data to listArr
          listArr.push({
            CLINIC: listName.innerText,
            ADDRESS: actualAddress.textContent,
            PHONE: actualPhone.textContent.replace("Tel.:", ""),
            EMAIL: actualEmail.textContent.replace("E-mail:", ""),
          });
        });

        return listArr;
      });

      //Save all data from every page (listArr[])
      data = data.concat(scrapContainer);

      //Write scrap data 
      // console.log(scrapContainer);
      // console.log(scrapContainer.length);

      //Export to JSON file
      await fs.writeFile("Dent-LekariAll.json", JSON.stringify(data));

      //Export to EXCEL file
      const convertJsonToExcel = () => {
        const workSheet = xlsx.utils.json_to_sheet(data);
        const workBook = xlsx.utils.book_new();

        xlsx.utils.book_append_sheet(workBook, workSheet, "Dates");
        // Generate buffer
        xlsx.write(workBook, { bookType: "xlsx", type: "buffer" });

        // Binary string
        xlsx.write(workBook, { bookType: "xlsx", type: "binary" });

        /* calculate column width */
        workSheet["!cols"] = [
          { wch: 30 },
          { wch: 50 },
          { wch: 30 },
          { wch: 30 },
        ];

        xlsx.writeFile(workBook, "Dent-LekariAll.xlsx", { compression: true });
      };
      convertJsonToExcel();

      //Export to CSV file
      const generateCSV = () => {
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, "test");
        xlsx.writeFile(wb, "Dent-LekariAll.csv");
      };
      generateCSV();
    }

    await browser.close();
  } catch (error) {
    console.error(error);
  }
})();
