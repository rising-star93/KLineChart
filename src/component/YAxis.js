/**
 * Copyright (c) 2019 lihu
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import Axis from './Axis'
import { TechnicalIndicatorType } from '../data/options/technicalIndicatorParamOptions'
import { formatBigNumber, formatValue } from '../utils/format'
import { YAxisType } from '../data/options/styleOptions'

export default class YAxis extends Axis {
  constructor (chartData, isCandleStickYAxis) {
    super(chartData)
    this._isCandleStickYAxis = isCandleStickYAxis
  }

  _compareMinMax (kLineData, technicalIndicatorType, minMaxArray) {
    const technicalIndicatorData = formatValue(kLineData, technicalIndicatorType.toLowerCase(), {})
    Object.keys(technicalIndicatorData).forEach(key => {
      const value = technicalIndicatorData[key]
      if (value || value === 0) {
        minMaxArray[0] = Math.min(minMaxArray[0], value)
        minMaxArray[1] = Math.max(minMaxArray[1], value)
      }
    })
    if (technicalIndicatorType === TechnicalIndicatorType.BOLL || technicalIndicatorType === TechnicalIndicatorType.SAR) {
      minMaxArray[0] = Math.min(minMaxArray[0], kLineData.low)
      minMaxArray[1] = Math.max(minMaxArray[1], kLineData.high)
    }
    return minMaxArray
  }

  _computeMinMaxValue () {
    let min = this._minValue
    let max = this._maxValue
    if (min === Infinity || max === -Infinity) {
      return { min: 0, max: 0, range: 0 }
    }

    let range = Math.abs(max - min)
    // 保证每次图形绘制上下都留间隙
    min = min - (range / 100.0) * 10.0
    max = max + (range / 100.0) * 20.0
    range = Math.abs(max - min)
    return { min, max, range }
  }

  _computeOptimalTicks (ticks) {
    const optimalTicks = []
    const tickLength = ticks.length
    if (tickLength > 0) {
      const textHeight = this._chartData.styleOptions().xAxis.tickText.size
      const y = this._innerConvertToPixel(+ticks[0].v)
      let tickCountDif = 1
      if (tickLength > 1) {
        const nextY = this._innerConvertToPixel(+ticks[1].v)
        const yDif = Math.abs(nextY - y)
        if (yDif < textHeight * 2) {
          tickCountDif = Math.ceil(textHeight * 2 / yDif)
        }
      }
      const isPercentageAxis = this.isPercentageYAxis()
      for (let i = 0; i < tickLength; i += tickCountDif) {
        const v = ticks[i].v
        const y = this._innerConvertToPixel(+v)
        if (y > textHeight &&
          y < this._height - textHeight) {
          optimalTicks.push({ v: isPercentageAxis ? `${(+v).toFixed(2)}%` : formatBigNumber(v), y })
        }
      }
    }
    return optimalTicks
  }

  /**
   * 计算最大最小值
   * @param technicalIndicatorType
   * @param isRealTime
   */
  calcMinMaxValue (technicalIndicatorType, isRealTime) {
    const dataList = this._chartData.dataList()
    const from = this._chartData.from()
    const to = this._chartData.to()
    const isShowAverageLine = this._chartData.styleOptions().realTime.averageLine.display
    const minMaxArray = [Infinity, -Infinity]
    if (isRealTime) {
      for (let i = from; i < to; i++) {
        const kLineData = dataList[i]
        const minCompareArray = [kLineData.close, minMaxArray[0]]
        const maxCompareArray = [kLineData.close, minMaxArray[1]]
        if (isShowAverageLine) {
          minCompareArray.push(kLineData.average)
          maxCompareArray.push(kLineData.average)
        }
        minMaxArray[0] = Math.min.apply(null, minCompareArray)
        minMaxArray[1] = Math.max.apply(null, maxCompareArray)
      }
    } else {
      for (let i = from; i < to; i++) {
        const kLineData = dataList[i]
        this._compareMinMax(kLineData, technicalIndicatorType, minMaxArray)
        if (this._isCandleStickYAxis) {
          minMaxArray[0] = Math.min(kLineData.low, minMaxArray[0])
          minMaxArray[1] = Math.max(kLineData.high, minMaxArray[1])
        }
      }
      if (technicalIndicatorType === TechnicalIndicatorType.VOL) {
        minMaxArray[0] = 0
      }
    }
    if (minMaxArray[0] !== Infinity && minMaxArray[1] !== -Infinity) {
      minMaxArray[0] = Math.round(minMaxArray[0] * 1000000) / 1000000
      minMaxArray[1] = Math.round(minMaxArray[1] * 1000000) / 1000000
      if (this.isPercentageYAxis()) {
        const fromClose = dataList[from].close
        this._minValue = (minMaxArray[0] - fromClose) / fromClose * 100
        this._maxValue = (minMaxArray[1] - fromClose) / fromClose * 100
        if (this._minValue === this._maxValue) {
          this._minValue -= 10
          this._maxValue += 10
        }
      } else {
        this._minValue = minMaxArray[0]
        this._maxValue = minMaxArray[1]
        if (this._minValue === this._maxValue) {
          this._minValue -= 1
          if (this._minValue < 0) {
            this._minValue = 0
            this._maxValue = Math.max(1, this._maxValue * 2)
          } else {
            this._maxValue += 1
          }
        }
      }
    }
  }

  _innerConvertToPixel (value) {
    return Math.round((1.0 - (value - this._minValue) / this._range) * this._height)
  }

  isCandleStickYAxis () {
    return this._isCandleStickYAxis
  }

  /**
   * 是否是蜡烛图y轴组件
   * @returns {boolean}
   */
  isPercentageYAxis () {
    return this._isCandleStickYAxis && this._chartData.styleOptions().yAxis.type === YAxisType.PERCENTAGE
  }

  convertFromPixel (pixel) {
    const yAxisValue = (1.0 - pixel / this._height) * this._range + this._minValue
    if (this.isPercentageYAxis()) {
      const fromClose = this._chartData.dataList()[this._chartData.from()].close
      return fromClose * yAxisValue / 100 + fromClose
    }
    return yAxisValue
  }

  convertToPixel (value) {
    let realValue = value
    if (this.isPercentageYAxis()) {
      const fromClose = this._chartData.dataList()[this._chartData.from()].close
      realValue = (value - fromClose) / fromClose * 100
    }
    return this._innerConvertToPixel(realValue)
  }
}
