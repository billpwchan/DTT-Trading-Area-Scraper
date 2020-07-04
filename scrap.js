const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
    });
    const page = await browser.newPage();
    await page.goto('http://api.map.baidu.com/library/CityList/1.4/examples/CityList.html');
    await page.setViewport({ width: 1920, height: 636 })

    // Extract Province-level Information
    const province = await page.evaluate(() => Array.from(document.querySelectorAll('#container > select:nth-child(1) > option'), element => element.textContent));
    const provinceIndex = await page.evaluate(() => Array.from(document.querySelectorAll('#container > select:nth-child(1) > option'), element => element.getAttribute('value')));
    var provinceMap = province.map(function (e, i) {
        return {
            'province': e,
            'province_index': provinceIndex[i]
        };
    });
    if (provinceMap[0].province_index === '') { provinceMap = provinceMap.slice(1); }
    // console.log(provinceMap)

    // Iterate Each Province
    for (let i = 0; i < provinceMap.length; i++) {
        await page.waitForSelector('#container > select:nth-child(1)')
        await page.click('#container > select:nth-child(1)');
        await page.waitForSelector('#container > select:nth-child(1)')
        await page.select('#container > select:nth-child(1)', provinceMap[i].province_index);
        await page.waitForSelector('#container > select:nth-child(1)')
        await page.click('#container > select:nth-child(1)');

        // Extract City-level Information
        await page.waitForSelector('#container > select:nth-child(2) > option')
        const city = await page.evaluate(() => Array.from(document.querySelectorAll('#container > select:nth-child(2) > option'), element => element.textContent));
        await page.waitForSelector('#container > select:nth-child(2) > option')
        const cityIndex = await page.evaluate(() => Array.from(document.querySelectorAll('#container > select:nth-child(2) > option'), element => element.getAttribute('value')));
        var cityMap = city.map(function (e, ci) {
            return {
                'province': provinceMap[i].province,
                'province_index': provinceMap[i].province_index,
                'city': e,
                'city_index': cityIndex[ci]
            };
        });
        console.log(cityMap)
        if (cityMap[0].city_index === '') { cityMap = cityMap.slice(1); }
        // console.log(cityMap)

        // Iterate Each City
        for (let j = 0; j < cityMap.length; j++) {
            await page.waitForSelector('#container > select:nth-child(2)')
            await page.click('#container > select:nth-child(2)');
            await page.waitForSelector('#container > select:nth-child(2)')
            await page.select('#container > select:nth-child(2)', cityMap[j].city_index);
            await page.waitFor('#container > select:nth-child(2)')
            await page.click('#container > select:nth-child(2)');

            // Extract City-level Information
            await page.waitForSelector('#container > select:nth-child(3) > option')
            const district = await page.evaluate(() => Array.from(document.querySelectorAll('#container > select:nth-child(3) > option'), element => element.textContent));
            await page.waitForSelector('#container > select:nth-child(3) > option')
            const districtIndex = await page.evaluate(() => Array.from(document.querySelectorAll('#container > select:nth-child(3) > option'), element => element.getAttribute('value')));
            var districtMap = district.map(function (e, di) {
                return {
                    'province': provinceMap[i].province,
                    'province_index': provinceMap[i].province_index,
                    'city': cityMap[j].city,
                    'city_index': cityMap[j].city_index,
                    'district': e,
                    'district_index': districtIndex[di]
                };
            });
            // if (districtMap[0].district_index === '') { districtMap = districtMap.slice(1); }
            console.log(districtMap)
        }
    }
    await browser.close();
})()