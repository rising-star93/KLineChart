# KLineChart
[![npm version](https://badgen.net/npm/v/klinecharts)](https://www.npmjs.com/package/klinecharts)
[![Build Status](https://travis-ci.org/liihuu/klineweb.svg?branch=master)](https://travis-ci.org/liihuu/klineweb)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/8cc3d651f78143bf8232cb4f7bfac7c2)](https://www.codacy.com/app/liihuu/klineweb?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=liihuu/klineweb&amp;utm_campaign=Badge_Grade)
[![size](https://badgen.net/bundlephobia/minzip/klinecharts@latest)](https://bundlephobia.com/result?p=klinecharts@latest)
[![types](https://badgen.net/npm/types/klinecharts)](types/index.d.ts)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

📈A kline library for browser. Support technical indicators, drawing marker maps and custom styles.
## Browser Support
The chart is based on canvas. In theory, as long as it supports canvas, it is the same on mobile.
## Installing
Using npm:

```bash
$ npm install klinecharts
```

Using yarn:

```bash
$ yarn add klinecharts
```

## API
```js
var chart = init(document.getElementById('div'))
chart.setStyle(style)
chart.setMainChartType(chartType)
chart.setMainIndicatorType(indicatorType)
chart.setSubIndicatorType(indicatorType)
chart.showVolChart(true)
chart.setDefaultRange(range)
chart.setMinRange(range)
chart.setMaxRange(range)
chart.addData(dataList, pos)
chart.getDataList()
chart.getMainIndicatorType()
chart.getSubIndicatorType()
chart.getStyle()
chart.isShowVolChart()
chart.clearData()
chart.getConvertPictureUrl()
chart.drawMarker(markerType)
chart.clearAllMarker()
```

## Data Source
Data source requires KLineData array.

The single data format is as follows:
```
{ open, close, high, low, volume, turnover, timestamp }
```

## Style Config
Used to configure the style of the chart. [Here is the details.](STYLE-CONFIG-DETAIL.md)

## Technical Indicators
<table>
    <tbody>
        <tr>
            <th>MA</th>
            <th>VOL</th>
            <th>MACD</th>
            <th>BOLL</th>
            <th>KDJ</th>
            <th>RSI</th>
            <th>BIAS</th>
            <th>BRAR</th>
            <th>CCI</th>
            <th>DMI</th>
        </tr>
        <tr>
            <th>✅</th>
            <th>✅</th>
            <th>✅</th>
            <th>✅</th>
            <th>✅</th>
            <th>✅</th>
            <th>✅</th>
            <th>✅</th>
            <th>✅</th>
            <th>✅</th>
        </tr>
        <tr>
            <th>CR</th>
            <th>PSY</th>
            <th>DMA</th>
            <th>TRIX</th>
            <th>OBV</th>
            <th>VR</th>
            <th>WR</th>
            <th>MTM</th>
            <th>SAR</th>
        </tr>
        <tr>
            <th>✅</th>
            <th>✅</th>
            <th>✅</th>
            <th>✅</th>
            <th>✅</th>
            <th>✅</th>
            <th>✅</th>
            <th>✅</th>
            <th>✅</th>
        </tr>
    </tbody>
</table>

## Marker Maps
**Does not support mobile.**
+ [x] Horizontal straight line
+ [x] Vertical straight line
+ [x] Straight line
+ [x] Parallel straight line
+ [x] Horizontal ray
+ [x] Vertical ray
+ [x] Ray
+ [x] Horizontal line segment
+ [x] Vertical line segment
+ [x] Line segment
+ [x] Price line
+ [x] Price channel line
+ [X] Fibonacci line

## Samples
[https://liihuu.github.io/kline](https://liihuu.github.io/kline)

## License
Copyright (c) 2019 lihu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
