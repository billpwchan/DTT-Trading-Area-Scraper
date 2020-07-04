const fs = require('fs');

fs.readFile('tradingAreas.json', 'utf8', function (err, data) {
    data = JSON.parse(data);
    for (var i = 0; i < data.length; i++) {
        console.log(data[i].trading_area)
    }
});

// 新创建地图
var map = new BMap.Map("map_container");
map.centerAndZoom(new BMap.Point(121.478125,31.229649), 12);

var cityList = new BMapLib.CityList({
    container: 'container',
    map: map
});

cityList.getBusiness('中关村', function(json){
    console.log('商圈');
    console.log(json);
});

cityList.getSubAreaList(131, function(json){
    console.log('城市列表');
    console.log(json);
});

cityList.addEventListener('cityclick', function(e){
    console.log(e);
});

