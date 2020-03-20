import View from './View'
import { TechnicalIndicatorType } from '../data/options/technicalIndicatorParamOptions'
import { YAxisType } from '../component/YAxis'
import { LineStyle } from '../data/options/styleOptions'

export default class TechnicalIndicatorView extends View {
  constructor (container, chartData, xAxis, yAxis, additionalDataProvider) {
    super(container, chartData)
    this._xAxis = xAxis
    this._yAxis = yAxis
    this._additionalDataProvider = additionalDataProvider
  }

  _draw () {
    this._drawGrid()
    this._drawTechnicalIndicator()
  }

  /**
   * 绘制网格
   * @private
   */
  _drawGrid () {
    const grid = this._chartData.styleOptions().grid
    if (!grid.display) {
      return
    }
    const horizontalGrid = grid.horizontal
    if (horizontalGrid.display) {
      this._ctx.strokeStyle = horizontalGrid.color
      this._ctx.lineWidth = horizontalGrid.size
      if (horizontalGrid.style === LineStyle.DASH) {
        this._ctx.setLineDash(horizontalGrid.dashValue)
      }
      this._xAxis.ticks().forEach(tick => {
        const x = tick.x
        this._ctx.beginPath()
        this._ctx.moveTo(x, 0)
        this._ctx.lineTo(x, this._height)
        this._ctx.stroke()
        this._ctx.closePath()
      })
    }
    const verticalGrid = grid.vertical
    if (verticalGrid.display) {
      this._ctx.strokeStyle = verticalGrid.color
      this._ctx.lineWidth = verticalGrid.size
      if (verticalGrid.style === LineStyle.DASH) {
        this._ctx.setLineDash(verticalGrid.dashValue)
      }
      this._yAxis.ticks().forEach(tick => {
        const y = tick.y
        this._ctx.beginPath()
        this._ctx.moveTo(0, y)
        this._ctx.lineTo(this._width, y)
        this._ctx.stroke()
        this._ctx.closePath()
      })
    }
    this._ctx.setLineDash([])
  }

  /**
   * 绘制指标
   * @private
   */
  _drawTechnicalIndicator () {
    let onDrawing
    const technicalIndicatorType = this._additionalDataProvider.technicalIndicatorType()
    const technicalIndicatorParams = this._chartData.technicalIndicatorParamOptions()[technicalIndicatorType] || []
    const linePoints = []
    const technicalIndicatorOptions = this._chartData.styleOptions().technicalIndicator
    switch (technicalIndicatorType) {
      case TechnicalIndicatorType.MA: {
        const dataKeys = []
        technicalIndicatorParams.forEach(p => {
          dataKeys.push(`ma${p}`)
        })
        const isCandleStick = this._yAxis.yAxisType() === YAxisType.CANDLE_STICK
        onDrawing = (x, i, kLineData, halfBarSpace) => {
          this._ohlcTechnicalIndicatorDrawing(
            i, x, halfBarSpace, technicalIndicatorOptions,
            kLineData, technicalIndicatorType, dataKeys,
            isCandleStick, (values) => {
              this._prepareLinePoints(x, values, linePoints)
            }
          )
        }
        break
      }

      case TechnicalIndicatorType.MACD: {
        onDrawing = (x, i, kLineData, halfBarSpace) => {
          const macd = kLineData.macd || {}
          this._prepareLinePoints(x, [macd.diff, macd.dea], linePoints)
          const refKLineData = this.storage.dataList[i - 1] || {}
          const macdValue = macd.macd
          const refMacdValue = (refKLineData.macd || {}).macd || Number.MIN_SAFE_INTEGER
          if (macdValue > 0) {
            this._ctx.strokeStyle = technicalIndicatorOptions.increasingColor
            this._ctx.fillStyle = technicalIndicatorOptions.increasingColor
          } else {
            this._ctx.strokeStyle = technicalIndicatorOptions.decreasingColor
            this._ctx.fillStyle = technicalIndicatorOptions.decreasingColor
          }
          const isFill = !((refMacdValue || refMacdValue === 0) && macdValue > refMacdValue)
          this._drawBars(x, halfBarSpace, macdValue, isFill)
        }
        break
      }

      case TechnicalIndicatorType.VOL: {
        onDrawing = (x, i, kLineData, halfBarSpace) => {
          const vol = kLineData.vol || {}
          const lineValues = []
          technicalIndicatorParams.forEach(p => {
            lineValues.push(vol[`ma${p}`])
          })
          this._prepareLinePoints(x, lineValues, linePoints)
          const refKLineData = this.storage.dataList[i - 1] || {}
          const close = kLineData.close
          const refClose = (refKLineData || {}).close || Number.MIN_SAFE_INTEGER
          if (close > refClose) {
            this._ctx.fillStyle = technicalIndicatorOptions.upColor
          } else {
            this._ctx.fillStyle = technicalIndicatorOptions.downColor
          }
          this._drawBars(x, halfBarSpace, vol.num, true)
        }
        break
      }

      case TechnicalIndicatorType.BOLL: {
        const isCandleStick = this._yAxis.yAxisType() === YAxisType.CANDLE_STICK
        onDrawing = (x, i, kLineData, halfBarSpace) => {
          this._ohlcTechnicalIndicatorDrawing(
            i, x, halfBarSpace, technicalIndicatorOptions,
            kLineData, technicalIndicatorType, ['up', 'mid', 'dn'],
            isCandleStick, (values) => {
              this._prepareLinePoints(x, values, linePoints)
            }
          )
        }
        break
      }

      case TechnicalIndicatorType.BIAS: {
        onDrawing = (x, i, kLineData) => {
          const bias = kLineData.bias || {}
          const lineValues = []
          technicalIndicatorParams.forEach(p => {
            lineValues.push(bias[`bias${p}`])
          })
          this._prepareLinePoints(x, lineValues, linePoints)
        }
        break
      }

      case TechnicalIndicatorType.BRAR: {
        onDrawing = (x, i, kLineData) => {
          const brar = kLineData.brar || {}
          this._prepareLinePoints(x, [brar.br, brar.ar], linePoints)
        }
        break
      }

      case TechnicalIndicatorType.CCI: {
        onDrawing = (x, i, kLineData) => {
          const cci = kLineData.cci || {}
          this._prepareLinePoints(x, [cci.cci], linePoints)
        }
        break
      }

      case TechnicalIndicatorType.CR: {
        onDrawing = (x, i, kLineData) => {
          const cr = kLineData.cr || {}
          this._prepareLinePoints(x, [cr.cr, cr.ma1, cr.ma2, cr.ma3, cr.ma4], linePoints)
        }
        break
      }

      case TechnicalIndicatorType.DMA: {
        onDrawing = (x, i, kLineData) => {
          const dma = kLineData.dma || {}
          this._prepareLinePoints(x, [dma.dif, dma.difMa], linePoints)
        }
        break
      }

      case TechnicalIndicatorType.DMI: {
        onDrawing = (x, i, kLineData) => {
          const dmi = kLineData.dmi || {}
          this._prepareLinePoints(x, [dmi.mdi, dmi.pdi, dmi.adx, dmi.adxr], linePoints)
        }
        break
      }

      case TechnicalIndicatorType.KDJ: {
        onDrawing = (x, i, kLineData) => {
          const kdj = kLineData.kdj || {}
          this._prepareLinePoints(x, [kdj.k, kdj.d, kdj.j], linePoints)
        }
        break
      }

      case TechnicalIndicatorType.RSI: {
        onDrawing = (x, i, kLineData) => {
          const rsi = kLineData.rsi || {}
          const lineValues = []
          technicalIndicatorParams.forEach(p => {
            lineValues.push(rsi[`rsi${p}`])
          })
          this._prepareLinePoints(x, lineValues, linePoints)
        }
        break
      }

      case TechnicalIndicatorType.PSY: {
        onDrawing = (x, i, kLineData) => {
          const psy = kLineData.psy || {}
          this._prepareLinePoints(x, [psy.psy], linePoints)
        }
        break
      }

      case TechnicalIndicatorType.TRIX: {
        onDrawing = (x, i, kLineData) => {
          const trix = kLineData.trix || {}
          this._prepareLinePoints(x, [trix.trix, trix.maTrix], linePoints)
        }
        break
      }

      case TechnicalIndicatorType.OBV: {
        onDrawing = (x, i, kLineData) => {
          const obv = kLineData.obv || {}
          this._prepareLinePoints(x, [obv.obv, obv.maObv], linePoints)
        }
        break
      }

      case TechnicalIndicatorType.VR: {
        onDrawing = (x, i, kLineData) => {
          const vr = kLineData.vr || {}
          this._prepareLinePoints(x, [vr.vr, vr.maVr], linePoints)
        }
        break
      }

      case TechnicalIndicatorType.WR: {
        onDrawing = (x, i, kLineData) => {
          const wr = kLineData.wr || {}
          this._prepareLinePoints(x, [wr.wr1, wr.wr2, wr.wr3], linePoints)
        }
        break
      }

      case TechnicalIndicatorType.MTM: {
        onDrawing = (x, i, kLineData) => {
          const mtm = kLineData.mtm || {}
          this._prepareLinePoints(x, [mtm.mtm, mtm.mtmMa], linePoints)
        }
        break
      }

      case TechnicalIndicatorType.EMV: {
        onDrawing = (x, i, kLineData) => {
          const emv = kLineData.emv || {}
          this._prepareLinePoints(x, [emv.emv, emv.maEmv], linePoints)
        }
        break
      }

      case TechnicalIndicatorType.SAR: {
        const isCandleStick = this._yAxis.yAxisType() === YAxisType.CANDLE_STICK
        onDrawing = (x, i, kLineData, halfBarSpace) => {
          this._ohlcTechnicalIndicatorDrawing(
            i, x, halfBarSpace, technicalIndicatorOptions,
            kLineData, technicalIndicatorType, ['sar'],
            isCandleStick, (values) => {
              const sar = values[0]
              if (sar || sar === 0) {
                const dataY = this._yAxis.convertToPixel(sar)
                if (sar < (kLineData.high + kLineData.low) / 2) {
                  this._ctx.strokeStyle = technicalIndicatorOptions.upColor
                } else {
                  this._ctx.strokeStyle = technicalIndicatorOptions.downColor
                }
                this._ctx.beginPath()
                this._ctx.arc(x, dataY, halfBarSpace, Math.PI * 2, 0, true)
                this._ctx.stroke()
                this._ctx.closePath()
              }
            }
          )
        }
      }
    }
    this._drawGraphics(onDrawing,
      () => {
        this._drawLines(linePoints, technicalIndicatorOptions)
      }
    )
  }

  /**
   * 需要绘制ohlc指标每条数据渲染
   * @param i
   * @param x
   * @param halfBarSpace
   * @param technicalIndicatorOptions
   * @param kLineData
   * @param technicalIndicatorType
   * @param dataKeys
   * @param isCandleStick
   * @param prepare
   */
  _ohlcTechnicalIndicatorDrawing (
    i, x, halfBarSpace, technicalIndicatorOptions,
    kLineData, technicalIndicatorType,
    dataKeys, isCandleStick, prepare
  ) {
    const technicalIndicatorData = kLineData[technicalIndicatorType.toLowerCase()] || {}
    const values = []
    dataKeys.forEach(key => {
      values.push(technicalIndicatorData[key])
    })
    if (prepare) {
      prepare(values)
    }
    if (!isCandleStick) {
      const refKLineData = this.storage.dataList[i - 1] || {}
      this._drawOhlc(
        halfBarSpace, x, kLineData,
        refKLineData, technicalIndicatorOptions.upColor, technicalIndicatorOptions.downColor
      )
    }
  }

  /**
   * 准备绘制线的数据
   * @param x
   * @param lineValues
   * @param linePoints
   */
  _prepareLinePoints (x, lineValues, linePoints) {
    for (let i = 0; i < lineValues.length; i++) {
      const value = lineValues[i]
      const valueY = this._yAxis.convertToPixel(value)
      if (!linePoints[i]) {
        linePoints[i] = [{ x: x, y: valueY }]
      } else {
        linePoints[i].push({ x: x, y: valueY })
      }
    }
  }

  /**
   * 绘制线
   * @param linePoints
   * @param technicalIndicatorOptions
   */
  _drawLines (linePoints, technicalIndicatorOptions) {
    const colors = technicalIndicatorOptions.colors
    const pointCount = linePoints.length
    const colorSize = (colors || []).length
    this._ctx.lineWidth = technicalIndicatorOptions.lineSize
    for (let i = 0; i < pointCount; i++) {
      const points = linePoints[i]
      if (points.length > 0) {
        this._ctx.strokeStyle = colors[i % colorSize]
        this._ctx.beginPath()
        this._ctx.moveTo(points[0].x, points[0].y)
        for (let j = 1; j < points.length; j++) {
          this._ctx.lineTo(points[j].x, points[j].y)
        }
        this._ctx.stroke()
        this._ctx.closePath()
      }
    }
  }

  /**
   * 绘制柱状图
   * @param x
   * @param halfBarSpace
   * @param barData
   * @param isFill
   */
  _drawBars (x, halfBarSpace, barData, isFill) {
    if (barData || barData === 0) {
      this._ctx.lineWidth = 1
      const dataY = this._yAxis.convertToPixel(barData)
      const zeroY = this._yAxis.convertToPixel(0)
      let y = dataY
      if (barData < 0) {
        y = zeroY
      }
      let barHeight = Math.abs(zeroY - dataY)
      if (barHeight < 1) {
        barHeight = 1
      }
      if (isFill) {
        this._ctx.fillRect(x - halfBarSpace, y, halfBarSpace * 2, barHeight)
      } else {
        this._ctx.strokeRect(x - halfBarSpace, y, halfBarSpace * 2, barHeight)
      }
    }
  }

  /**
   * 绘制ohlc
   * @param halfBarSpace
   * @param x
   * @param kLineData
   * @param refKLineData
   * @param increasingColor
   * @param decreasingColor
   * @private
   */
  _drawOhlc (halfBarSpace, x, kLineData, refKLineData, increasingColor, decreasingColor) {
    const openY = this._yAxis.convertToPixel(kLineData.open)
    const closeY = this._yAxis.convertToPixel(kLineData.close)
    const highY = this._yAxis.convertToPixel(kLineData.high)
    const lowY = this._yAxis.convertToPixel(kLineData.low)
    if (kLineData.close > refKLineData.close) {
      this._ctx.strokeStyle = increasingColor
    } else {
      this._ctx.strokeStyle = decreasingColor
    }
    this._ctx.lineWidth = 1
    this._ctx.beginPath()
    this._ctx.moveTo(x, highY)
    this._ctx.lineTo(x, lowY)
    this._ctx.stroke()
    this._ctx.closePath()

    this._ctx.beginPath()
    this._ctx.moveTo(x - halfBarSpace, openY)
    this._ctx.lineTo(x, openY)
    this._ctx.stroke()
    this._ctx.closePath()

    this._ctx.beginPath()
    this._ctx.moveTo(x + halfBarSpace, closeY)
    this._ctx.lineTo(x, closeY)
    this._ctx.stroke()
    this._ctx.closePath()
  }

  /**
   * 绘制图形
   * @param onDrawing
   * @param onDrawEnd
   * @private
   */
  _drawGraphics (onDrawing, onDrawEnd) {
    let startX = 0
    const dataList = this._chartData.dataList()
    const barSpace = this._chartData.barSpace()
    const dataSpace = this._chartData.dataSpace()
    const halfBarSpace = barSpace / 2
    const to = this._chartData.to()
    for (let i = this._chartData.from(); i < to; i++) {
      const endX = startX + barSpace
      const x = (startX + endX) / 2
      const kLineData = dataList[i]
      if (onDrawing) {
        onDrawing(x, i, kLineData, halfBarSpace, barSpace)
      }
      startX += dataSpace
    }
    if (onDrawEnd) {
      onDrawEnd()
    }
  }
}
