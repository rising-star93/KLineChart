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

import TechnicalIndicator from './TechnicalIndicator'

import MovingAverage from './directionalmovement/MovingAverage'
import ExponentialMovingAverage from './directionalmovement/ExponentialMovingAverage'
import Volume from './volume/Volume'
import MovingAverageConvergenceDivergence from './directionalmovement/MovingAverageConvergenceDivergence'
import BollingerBands from './volatility/BollingerBands'
import StockIndicatorKDJ from './oscillators/StockIndicatorKDJ'
import RelativeStrengthIndex from './oscillators/RelativeStrengthIndex'
import Bias from './oscillators/Bias'
import Brar from './momentum/Brar'
import CommodityChannelIndex from './oscillators/CommodityChannelIndex'
import DirectionalMovementIndex from './directionalmovement/DirectionalMovementIndex'
import CurrentRatio from './momentum/CurrentRatio'
import PsychologicalLine from './momentum/PsychologicalLine'
import DifferentOfMovingAverage from './directionalmovement/DifferentOfMovingAverage'
import TripleExponentiallySmoothedAverage from './directionalmovement/TripleExponentiallySmoothedAverage'
import OnBalanceVolume from './volume/OnBalanceVolume'
import VolumeRatio from './momentum/VolumeRatio'
import WilliamsR from './oscillators/WilliamsR'
import Momentum from './momentum/Momentum'
import StopAndReverse from './volatility/StopAndReverse'
import EaseOfMovementValue from './directionalmovement/EaseOfMovementValue'

import {
  MA, EMA, VOL, MACD, KDJ, BOLL, RSI,
  BIAS, BRAR, CCI, DMI, CR, PSY, DMA,
  TRIX, OBV, VR, WR, MTM, EMV, SAR
} from './technicalIndicatorType'
import { isFunction, isValid } from '../../utils/typeChecks'
import { formatBigNumber, formatPrecision } from '../../utils/format'
import { DEV } from '../../utils/env'

/**
 * 创建技术指标集合
 */
export function createTechnicalIndicators () {
  return {
    [MA]: MovingAverage,
    [EMA]: ExponentialMovingAverage,
    [VOL]: Volume,
    [MACD]: MovingAverageConvergenceDivergence,
    [BOLL]: BollingerBands,
    [KDJ]: StockIndicatorKDJ,
    [RSI]: RelativeStrengthIndex,
    [BIAS]: Bias,
    [BRAR]: Brar,
    [CCI]: CommodityChannelIndex,
    [DMI]: DirectionalMovementIndex,
    [CR]: CurrentRatio,
    [PSY]: PsychologicalLine,
    [DMA]: DifferentOfMovingAverage,
    [TRIX]: TripleExponentiallySmoothedAverage,
    [OBV]: OnBalanceVolume,
    [VR]: VolumeRatio,
    [WR]: WilliamsR,
    [MTM]: Momentum,
    [EMV]: EaseOfMovementValue,
    [SAR]: StopAndReverse
  }
}

/**
 * 创建一个新的技术指标
 * @param technicalIndicatorInfo
 * @returns {NewTechnicalIndicator}
 */
export function createNewTechnicalIndicator ({
  name, calcParams, plots, precision, shouldCheckParamCount,
  shouldOhlc, shouldFormatBigNumber, baseValue, minValue, maxValue,
  calcTechnicalIndicator, regeneratePlots
}) {
  if (!name || !isFunction(calcTechnicalIndicator)) {
    if (DEV) {
      console.warn(
        'The required attribute "name" and method "calcTechnicalIndicator" are missing, and new technical indicator cannot be generated!!!'
      )
    }
    return null
  }
  class NewTechnicalIndicator extends TechnicalIndicator {
    constructor () {
      super(
        {
          name,
          calcParams,
          plots,
          precision,
          shouldCheckParamCount,
          shouldOhlc,
          shouldFormatBigNumber,
          baseValue,
          minValue,
          maxValue
        }
      )
    }
  }
  NewTechnicalIndicator.prototype.calcTechnicalIndicator = calcTechnicalIndicator
  if (regeneratePlots) {
    NewTechnicalIndicator.prototype.regeneratePlots = regeneratePlots
  }
  return NewTechnicalIndicator
}

/**
 * 获取技术指标信息
 * @param technicalIndicatorData
 * @param technicalIndicator
 * @param yAxis
 * @returns {{values: [], name: string, labels: []}}
 */
export function getTechnicalIndicatorInfo (technicalIndicatorData = {}, technicalIndicator, yAxis) {
  const calcParams = technicalIndicator.calcParams
  const plots = technicalIndicator.plots
  const precision = technicalIndicator.precision
  const shouldFormatBigNumber = technicalIndicator.shouldFormatBigNumber

  const labels = []
  const values = []
  let name = ''
  if (plots.length > 0) {
    name = technicalIndicator.name
  }
  if (calcParams.length > 0) {
    name = `${name}(${calcParams.join(',')})`
  }
  plots.forEach(plot => {
    labels.push(plot.key.toUpperCase())
    let value = technicalIndicatorData[plot.key]
    let y
    if (isValid(value)) {
      y = yAxis.convertToPixel(value)
      value = formatPrecision(value, precision)
      if (shouldFormatBigNumber) {
        value = formatBigNumber(value)
      }
    }
    values.push({ value, y })
  })
  return { labels, values, name }
}
