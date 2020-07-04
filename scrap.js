const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
    });
    const page = await browser.newPage();
    await page.goto('http://api.map.baidu.com/library/CityList/1.4/examples/CityList.html');
    await page.setViewport({ width: 1920, height: 636 })

    var output_array = []

    // Extract Province-level Information
    const province = await page.evaluate(() => Array.from(document.querySelectorAll('#container > select:nth-child(1) > option'), element => element.textContent));
    const provinceIndex = await page.evaluate(() => Array.from(document.querySelectorAll('#container > select:nth-child(1) > option'), element => element.getAttribute('value')));
    var provinceMap = province.map(function (e, pi) {
        return {
            'province': e,
            'province_index': provinceIndex[pi]
        };
    });
    if (provinceMap[0].province_index === '') { provinceMap = provinceMap.slice(1); }
    // console.log(provinceMap)

    // Iterate Each Province
    for (let i = 0; i < provinceMap.length; i++) {
        await page.waitForSelector('#container > select:nth-child(1)')
        await page.click('#container > select:nth-child(1)');
        await page.waitForSelector('#container > select:nth-child(1) > option')
        await page.select('#container > select:nth-child(1)', provinceMap[i].province_index);
        await page.waitForSelector('#container > select:nth-child(1)')
        await page.click('#container > select:nth-child(1)');

        // Extract City-level Information
        // await page.waitForSelector('#container > select:nth-child(2)')
        try {
            await page.waitForSelector('#container > select:nth-child(2) > option', { timeout: 500 })
            // ...
        } catch (error) {
            console.log("The element didn't appear.")
        }
        const city = await page.evaluate(() => Array.from(document.querySelectorAll('#container > select:nth-child(2) > option'), element => element.textContent));
        if (city.length === 0) {
            console.log("<ERROR> EMPTY CITY>");
            continue;
        }
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
        if (cityMap[0].city_index === '') { cityMap = cityMap.slice(1); }
        // console.log(cityMap)

        // Iterate Each City
        for (let j = 0; j < cityMap.length; j++) {
            await page.waitForSelector('#container > select:nth-child(2)')
            await page.click('#container > select:nth-child(2)');
            await page.waitForSelector('#container > select:nth-child(2) > option')
            await page.select('#container > select:nth-child(2)', cityMap[j].city_index);
            await page.waitFor('#container > select:nth-child(2)')
            await page.click('#container > select:nth-child(2)');

            // Extract District-level Information
            // await page.waitForSelector('#container > select:nth-child(3)')
            // await page.waitFor(500)
            try {
                await page.waitForSelector('#container > select:nth-child(3) > option', { timeout: 500 })
                // ...
            } catch (error) {
                console.log("The element didn't appear.")
            }
            const district = await page.evaluate(() => Array.from(document.querySelectorAll('#container > select:nth-child(3) > option'), element => element.textContent));
            if (district.length === 0) {
                console.log("<ERROR> EMPTY DISTRICT")
                continue;
            }
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
            if (districtMap[0].district_index === '') { districtMap = districtMap.slice(1); }
            // console.log(districtMap)

            for (let k = 0; k < districtMap.length; k++) {
                await page.waitForSelector('#container > select:nth-child(3)')
                await page.click('#container > select:nth-child(3)');
                await page.waitForSelector('#container > select:nth-child(3) > option')
                await page.select('#container > select:nth-child(3)', districtMap[k].district_index);
                await page.waitFor('#container > select:nth-child(3)')
                await page.click('#container > select:nth-child(3)');

                // Extract City-level Information
                // await page.waitForSelector('#container > select:nth-child(4) > option')
                try {
                    await page.waitForSelector('#container > select:nth-child(4) > option', { timeout: 500 })
                    // ...
                } catch (error) {
                    console.log("The element didn't appear.")
                } 
                const tradingArea = await page.evaluate(() => Array.from(document.querySelectorAll('#container > select:nth-child(4) > option'), element => element.textContent));
                if (tradingArea.length === 0) {
                    console.log("<INFO>EMPTY TRADING AREA")
                    continue;
                }
                await page.waitForSelector('#container > select:nth-child(4) > option')
                const tradingAreaIndex = await page.evaluate(() => Array.from(document.querySelectorAll('#container > select:nth-child(4) > option'), element => element.getAttribute('value')));
                var tradingAreaMap = tradingArea.map(function (e, tai) {
                    return {
                        'province': provinceMap[i].province,
                        'province_index': provinceMap[i].province_index,
                        'city': cityMap[j].city,
                        'city_index': cityMap[j].city_index,
                        'district': districtMap[k].district,
                        'district_index': districtMap[k].district_index,
                        'trading_area': e,
                        'trading_area_index': tradingAreaIndex[tai]
                    };
                });
                if (tradingAreaMap[0].trading_area_index === '') { tradingAreaMap = tradingAreaMap.slice(1); }
                console.log(tradingAreaMap);
                output_array.push(...tradingAreaMap)
            }
        }
        // console.log(output_array)
    }
    fs.writeFileSync('tradingAreas.json', JSON.stringify(output_array));
    await browser.close();
})()