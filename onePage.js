const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    slowMo: 2000,
    devtools: true,
  });
  const page = await browser.newPage();
  await page.goto("https://www.dent.cz/zubni-lekari");
  await page.waitForSelector(".cross-cross-dentists-list");


  const scrapContainer = await page.evaluate(() => {
    // debugger;

    const wrapList = document.querySelectorAll(
      ".u-mb-lg .cross-cross-dentists-list .row .cross-dentists-list__item"
    );
    let listArr = [];

    wrapList.forEach((item) => {
      //Name ambulance
      const listName = item.querySelector("h3 a");
      //Select p(2x) tag and create variable for every <p>
      const listParagraph = item.querySelectorAll("p");
      const actualAddress = listParagraph[0];

      //   actualAddress.removeChild(actualAddress.lastElementChild)
      //   const clearAddress = actualAddress.remove("strong")
      // const clearAddress = actualAddress.querySelectorAll("strong");
      // clearAddress.parentNode.removeChild(clearAddress);
      console.log(listParagraph);


      //   const actualMoreInfo = listParagraph[1];
      //Select strong(2x) tag from actualAddress (first p) element
      const listStrong = actualAddress.querySelectorAll("strong");
      const actualPhone = listStrong[0];
      const actualEmail = listStrong[1];

      //Push data to listArr
      listArr.push({
        name: listName.innerText,
        address: actualAddress.textContent,
        // address: clearAddress.innerText,
        phone: actualPhone.textContent,
        email: actualEmail.textContent,
      });
    });

    return listArr;
  });
  console.log(scrapContainer);
  console.log(scrapContainer.length)

  await browser.close();
})();

// const wrapList = document.querySelectorAll(".u-mb-lg .cross-cross-dentists-list .row .cross-dentists-list__item");
