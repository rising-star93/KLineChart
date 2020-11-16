/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 * http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import TechnicalIndicatorView from './TechnicalIndicatorView'
import { CandleType, LineStyle } from '../data/options/styleOptions'
import { renderHorizontalLine, renderVerticalLine, renderLine } from '../renderer/line'
import { createFont } from '../utils/canvas'
import { formatPrecision, formatValue } from '../utils/format'
import { isArray } from '../utils/typeChecks'

export default class CandleView extends TechnicalIndicatorView {
  _draw () {
    this._drawGrid()
    const candleOptions = this._chartData.styleOptions().candle
    if (candleOptions.type === CandleType.AREA) {
      this._drawArea(candleOptions)
    } else {
      this._drawCandle(candleOptions)
      this._drawLowHighPrice(
        candleOptions.priceMark, 'high', 'high', -Infinity, [-2, -5],
        (price, comparePrice) => {
          if (price > comparePrice) {
            return price
          }
        }
      )
      this._drawLowHighPrice(
        candleOptions.priceMark, 'low', 'low', Infinity, [2, 5],
        (price, comparePrice) => {
          if (price < comparePrice) {
            return price
          }
        }
      )
    }
    this._drawTechnicalIndicator()
    this._drawLastPriceLine(candleOptions.priceMark)
  }

  /**
   * 绘制面积图
   * @param candleOptions
   * @private
   */
  _drawArea (candleOptions) {
    const timeLinePoints = []
    const timeLineAreaPoints = []
    const from = this._chartData.from()
    let minCloseY = Infinity
    const onDrawing = (x, i, kLineData, halfBarSpace) => {
      const closeY = this._yAxis.convertToPixel(kLineData.close)
      if (i === from) {
        const startX = x - halfBarSpace
        timeLineAreaPoints.push({ x: startX, y: this._height })
        timeLineAreaPoints.push({ x: startX, y: closeY })
        timeLinePoints.push({ x: startX, y: closeY })
      }
      timeLinePoints.push({ x: x, y: closeY })
      timeLineAreaPoints.push({ x: x, y: closeY })
      minCloseY = Math.min(minCloseY, closeY)
    }
    const onDrawEnd = () => {
      const areaPointLength = timeLineAreaPoints.length
      if (areaPointLength > 0) {
        const lastPoint = timeLineAreaPoints[areaPointLength - 1]
        const halfBarSpace = this._chartData.barSpace() / 2
        const endX = lastPoint.x + halfBarSpace
        timeLinePoints.push({ x: endX, y: lastPoint.y })
        timeLineAreaPoints.push({ x: endX, y: lastPoint.y })
        timeLineAreaPoints.push({ x: endX, y: this._height })
      }

      const areaOptions = candleOptions.area
      if (timeLinePoints.length > 0) {
        // 绘制分时线
        this._ctx.lineWidth = areaOptions.lineSize
        this._ctx.strokeStyle = areaOptions.lineColor
        renderLine(this._ctx, () => {
          this._ctx.beginPath()
          this._ctx.moveTo(timeLinePoints[0].x, timeLinePoints[0].y)
          for (let i = 1; i < timeLinePoints.length; i++) {
            this._ctx.lineTo(timeLinePoints[i].x, timeLinePoints[i].y)
          }
          this._ctx.stroke()
          this._ctx.closePath()
        })
      }

      if (timeLineAreaPoints.length > 0) {
        // 绘制分时线填充区域
        const fillColor = areaOptions.fillColor
        if (isArray(fillColor)) {
          const gradient = this._ctx.createLinearGradient(0, this._height, 0, minCloseY)
          try {
            fillColor.forEach(({ offset, color }) => {
              gradient.addColorStop(offset, color)
            })
          } catch (e) {
          }
          this._ctx.fillStyle = gradient
        } else {
          this._ctx.fillStyle = fillColor
        }
        this._ctx.beginPath()
        this._ctx.moveTo(timeLineAreaPoints[0].x, timeLineAreaPoints[0].y)
        for (let i = 1; i < timeLineAreaPoints.length; i++) {
          this._ctx.lineTo(timeLineAreaPoints[i].x, timeLineAreaPoints[i].y)
        }
        this._ctx.closePath()
        this._ctx.fill()
      }
    }
    this._drawGraphics(onDrawing, onDrawEnd)
  }

  /**
   * 绘制蜡烛
   * @param candleOptions
   * @private
   */
  _drawCandle (candleOptions) {
    this._drawGraphics((x, i, kLineData, halfBarSpace, barSpace) => {
      this._drawCandleBar(x, halfBarSpace, barSpace, i, kLineData, candleOptions.bar, candleOptions.type)
    })
  }

  /**
   * 渲染最高最低价格
   * @param priceMarkOptions
   * @param optionKey
   * @param priceKey
   * @param initPriceValue
   * @param offsets
   * @param compare
   * @private
   */
  _drawLowHighPrice (priceMarkOptions, optionKey, priceKey, initPriceValue, offsets, compare) {
    const lowHighPriceMarkOptions = priceMarkOptions[optionKey]
    if (!priceMarkOptions.show || !lowHighPriceMarkOptions.show) {
      return
    }
    const dataList = this._chartData.dataList()
    const to = this._chartData.to()
    let price = initPriceValue
    let pos = -1
    for (let i = this._chartData.from(); i < to; i++) {
      const comparePrice = compare(formatValue(dataList[i], priceKey, initPriceValue), price)
      if (comparePrice) {
        price = comparePrice
        pos = i
      }
    }

    const pricePrecision = this._chartData.pricePrecision()
    const priceY = this._yAxis.convertToPixel(price)
    const startX = this._xAxis.convertToPixel(pos)
    const startY = priceY + offsets[0]
    this._ctx.textAlign = 'left'
    this._ctx.lineWidth = 1
    this._ctx.strokeStyle = lowHighPriceMarkOptions.color
    this._ctx.fillStyle = lowHighPriceMarkOptions.color

    renderLine(this._ctx, () => {
      this._ctx.beginPath()
      this._ctx.moveTo(startX, startY)
      this._ctx.lineTo(startX - 2, startY + offsets[0])
      this._ctx.stroke()
      this._ctx.closePath()

      this._ctx.beginPath()
      this._ctx.moveTo(startX, startY)
      this._ctx.lineTo(startX + 2, startY + offsets[0])
      this._ctx.stroke()
      this._ctx.closePath()
    })

    // 绘制竖线
    const y = startY + offsets[1]
    renderVerticalLine(this._ctx, startX, startY, y)
    renderHorizontalLine(this._ctx, y, startX, startX + 5)

    this._ctx.font = createFont(lowHighPriceMarkOptions.textSize, lowHighPriceMarkOptions.textWeight, lowHighPriceMarkOptions.textFamily)
    const text = formatPrecision(price, pricePrecision)
    this._ctx.textBaseline = 'middle'
    this._ctx.fillText(text, startX + 5 + lowHighPriceMarkOptions.textMargin, y)
  }

  /**
   * 绘制最新价线
   * @param priceMarkOptions
   * @private
   */
  _drawLastPriceLine (priceMarkOptions) {
    const lastPriceMarkOptions = priceMarkOptions.last
    if (!priceMarkOptions.show || !lastPriceMarkOptions.show || !lastPriceMarkOptions.line.show) {
      return
    }
    const dataList = this._chartData.dataList()
    const kLineData = dataList.last()
    if (!kLineData) {
      return
    }
    const close = kLineData.close
    const open = kLineData.open
    let priceY = this._yAxis.convertToPixel(close)
    priceY = +(Math.max(this._height * 0.05, Math.min(priceY, this._height * 0.98))).toFixed(0)
    let color
    if (close > open) {
      color = lastPriceMarkOptions.upColor
    } else if (close < open) {
      color = lastPriceMarkOptions.downColor
    } else {
      color = lastPriceMarkOptions.noChangeColor
    }
    this._ctx.save()
    this._ctx.strokeStyle = color
    this._ctx.lineWidth = lastPriceMarkOptions.line.size
    if (lastPriceMarkOptions.line.style === LineStyle.DASH) {
      this._ctx.setLineDash(lastPriceMarkOptions.line.dashValue)
    }
    renderHorizontalLine(this._ctx, priceY, 0, this._width)
    this._ctx.restore()
  }
}