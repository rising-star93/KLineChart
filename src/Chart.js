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

import ChartPane from './pane/ChartPane'
import { clone, isNumber, isValid, isArray } from './utils/typeChecks'
import { logWarn } from './utils/logger'

export default class Chart {
  constructor (container, styleOptions) {
    this._chartPane = new ChartPane(container, styleOptions)
  }

  /**
   * 获取宽尺寸
   * @return {*|{}}
   */
  getWidth () {
    return this._chartPane.chartWidth()
  }

  /**
   * 获取高度尺寸
   * @return {*|{}}
   */
  getHeight () {
    return this._chartPane.chartHeight()
  }

  /**
   * 设置样式配置
   * @param options
   */
  setStyleOptions (options) {
    if (options) {
      this._chartPane.chartData().applyStyleOptions(options)
      this._chartPane.adjustPaneViewport(true, true, true, true, true)
    }
  }

  /**
   * 获取样式配置
   * @returns {[]|*[]}
   */
  getStyleOptions () {
    return clone(this._chartPane.chartData().styleOptions())
  }

  /**
   * 覆盖技术指标
   * @param override
   */
  overrideTechnicalIndicator (override) {
    this._chartPane.overrideTechnicalIndicator(override)
  }

  /**
   * 获取技术指标名字获取技术指标
   * @param name
   * @return {{}|{series: *, calcParams: *, precision: *, name: *}}
   */
  getTechnicalIndicatorByName (name) {
    return this._chartPane.chartData().technicalIndicatorInfo(name)
  }

  /**
   * 获取窗口上的技术指标
   * @param paneId
   * @return {{}}
   */
  getTechnicalIndicatorByPaneId (paneId) {
    return this._chartPane.getPaneTechnicalIndicator(paneId)
  }

  /**
   * 设置价格数量精度
   * @param pricePrecision
   * @param volumePrecision
   */
  setPriceVolumePrecision (pricePrecision, volumePrecision) {
    if (!isValid(pricePrecision) || !isNumber(pricePrecision) || pricePrecision < 0) {
      logWarn('setPriceVolumePrecision', 'pricePrecision', 'pricePrecision must be a number and greater than zero!!!')
      return
    }
    if (!isValid(volumePrecision) || !isNumber(volumePrecision) || volumePrecision < 0) {
      logWarn('setPriceVolumePrecision', 'volumePrecision', 'volumePrecision must be a number and greater than zero!!!')
      return
    }
    this._chartPane.chartData().applyPriceVolumePrecision(pricePrecision, volumePrecision)
  }

  /**
   * 设置时区
   * @param timezone
   */
  setTimezone (timezone) {
    this._chartPane.setTimezone(timezone)
  }

  /**
   * 获取当前时区
   */
  getTimezone () {
    return this._chartPane.chartData().timezone()
  }

  /**
   * 重置尺寸，总是会填充父容器
   */
  resize () {
    this._chartPane.adjustPaneViewport(true, true, true, true, true)
  }

  /**
   * 设置右边间距
   * @param space
   */
  setOffsetRightSpace (space) {
    this._chartPane.chartData().setOffsetRightSpace(space)
  }

  /**
   * 设置左边可见的最小bar数量
   * @param barCount
   */
  setLeftMinVisibleBarCount (barCount) {
    if (!isValid(barCount) || !isNumber(barCount) || barCount <= 0) {
      logWarn('setLeftMinVisibleBarCount', 'barCount', 'barCount must be a number and greater than zero!!!')
      return
    }
    this._chartPane.chartData().setLeftMinVisibleBarCount(Math.ceil(barCount))
  }

  /**
   * 设置右边可见的最小bar数量
   * @param barCount
   */
  setRightMinVisibleBarCount (barCount) {
    if (!isValid(barCount) || !isNumber(barCount) || barCount <= 0) {
      logWarn('setRightMinVisibleBarCount', 'barCount', 'barCount must be a number and greater than zero!!!')
      return
    }
    this._chartPane.chartData().setRightMinVisibleBarCount(Math.ceil(barCount))
  }

  /**
   * 设置一条数据的空间
   * @param space
   */
  setDataSpace (space) {
    this._chartPane.chartData().setDataSpace(space)
  }

  /**
   * 清空数据
   */
  clearData () {
    this._chartPane.chartData().clearDataList()
  }

  /**
   * 获取数据源
   */
  getDataList () {
    return this._chartPane.chartData().dataList()
  }

  /**
   * 添加新数据
   * @param dataList
   * @param more
   */
  applyNewData (dataList, more) {
    if (!isArray(dataList)) {
      logWarn('applyNewData', 'dataList', 'dataList must be an array!!!')
      return
    }
    this._chartPane.applyNewData(dataList, more)
  }

  /**
   * 添加历史更多数据
   * @param dataList
   * @param more
   */
  applyMoreData (dataList, more) {
    if (!isArray(dataList)) {
      logWarn('applyMoreData', 'dataList', 'dataList must be an array!!!')
      return
    }
    this._chartPane.applyMoreData(dataList, more)
  }

  /**
   * 更新数据
   * @param data
   */
  updateData (data) {
    this._chartPane.updateData(data)
  }

  /**
   * 设置加载更多回调
   * @param cb
   */
  loadMore (cb) {
    this._chartPane.chartData().loadMore(cb)
  }

  /**
   * 创建一个技术指标
   * @param name 指标名
   * @param isStack 是否覆盖
   * @param paneOptions
   * @returns {string|null}
   */
  createTechnicalIndicator (name, isStack, paneOptions) {
    const technicalIndicator = this._chartPane.chartData().technicalIndicator(name)
    if (!technicalIndicator) {
      logWarn('createTechnicalIndicator', 'name', 'can not find the corresponding technical indicator!!!')
      return null
    }
    return this._chartPane.createTechnicalIndicator(technicalIndicator, isStack, paneOptions)
  }

  /**
   * 添加自定义技术指标
   * @param technicalIndicatorInfo
   */
  addCustomTechnicalIndicator (technicalIndicatorInfo) {
    this._chartPane.chartData().addCustomTechnicalIndicator(technicalIndicatorInfo)
  }

  /**
   * 移除一个技术指标
   * @param paneId
   * @param name
   */
  removeTechnicalIndicator (paneId, name) {
    this._chartPane.removeTechnicalIndicator(paneId, name)
  }

  /**
   * 创建图形标记
   * @param name
   * @param options
   */
  createGraphicMark (name, options) {
    const graphicMarkMapping = this._chartPane.chartData().graphicMarkMapping()
    const GraphicMark = graphicMarkMapping[name]
    if (!GraphicMark) {
      logWarn('createGraphicMark', 'name', 'can not find the corresponding graphic mark!!!')
      return null
    }
    const id = this._chartPane.createGraphicMark(GraphicMark, options)
    if (!id) {
      logWarn('createGraphicMark', 'options.id', 'duplicate id!!!')
    }
    return id
  }

  /**
   * 获取图形标记
   * @param id
   * @return {{name, lock: *, styles, id, points: (*|*[])}[]|{name, lock: *, styles, id, points: (*|*[])}}
   */
  getGraphicMark (id) {
    return this._chartPane.chartData().getGraphicMark(id)
  }

  /**
   * 设置图形标记配置
   * @param id
   * @param options
   */
  setGraphicMarkOptions (id, options) {
    this._chartPane.chartData().setGraphicMarkOptions(id, options)
  }

  /**
   * 添加自定义图形标记
   * @param graphicMark
   */
  addCustomGraphicMark (graphicMark) {
    this._chartPane.chartData().addCustomGraphicMark(graphicMark)
  }

  /**
   * 移除图形标记
   * @param graphicMarkId
   */
  removeGraphicMark (graphicMarkId) {
    if (graphicMarkId) {
      this._chartPane.chartData().removeGraphicMarkInstance(graphicMarkId)
    } else {
      this._chartPane.chartData().clearGraphicMark()
    }
  }

  /**
   * 创建注解
   * @param annotations
   */
  createAnnotation (annotations) {
    this._chartPane.createAnnotation(annotations)
  }

  /**
   * 移除注解
   */
  removeAnnotation (points) {
    this._chartPane.chartData().removeAnnotation(points)
  }

  /**
   * 设置窗口属性
   * @param options
   */
  setPaneOptions (options = {}) {
    this._chartPane.setPaneOptions(options, false)
  }

  /**
   * 设置是否可以缩放
   * @param enabled
   */
  setZoomEnabled (enabled) {
    this._chartPane.chartData().setZoomEnabled(enabled)
  }

  /**
   * 是否可以缩放
   * @return {boolean}
   */
  isZoomEnabled () {
    return this._chartPane.chartData().zoomEnabled()
  }

  /**
   * 设置是否可以拖拽滚动
   * @param enabled
   */
  setScrollEnabled (enabled) {
    this._chartPane.chartData().setScrollEnabled(enabled)
  }

  /**
   * 是否可以拖拽滚动
   * @return {boolean}
   */
  isScrollEnabled () {
    return this._chartPane.chartData().scrollEnabled()
  }

  /**
   * 按距离滚动
   * @param distance
   * @param animationDuration
   */
  scrollByDistance (distance, animationDuration) {
    if (!isNumber(distance)) {
      logWarn('scrollByDistance', 'distance', 'distance must be a number!!!')
      return
    }
    if (isNumber(animationDuration) && animationDuration > 0) {
      this._chartPane.chartData().scrollAnimated(distance, animationDuration)
    } else {
      this._chartPane.chartData().startScroll()
      this._chartPane.chartData().scroll(distance)
    }
  }

  /**
   *
   */
  scrollToRealTime (animationDuration) {

  }

  /**
   * 将值装换成像素
   * @param value
   * @param finder
   */
  convertToPixel (value, finder) {
    return this._chartPane.convertToPixel(value, finder)
  }

  /**
   * 将像素转换成值
   * @param coordinate
   * @param finder
   */
  convertFromPixel (coordinate, finder) {
    return this._chartPane.convertFromPixel(coordinate, finder)
  }

  /**
   * 订阅图表动作
   * @param type
   * @param callback
   */
  subscribeAction (type, callback) {
    if (type === 'drawCandle' || type === 'drawTechnicalIndicator') {
      logWarn('subscribeAction', '', 'the types drawCandle and drawTechnicalIndicator have been deprecated, please use createAnnotation instead!!!')
    }
    if (!this._chartPane.chartData().subscribeAction(type, callback)) {
      logWarn('subscribeAction', 'type', 'type does not exist!!!')
    }
  }

  /**
   * 取消订阅图表动作
   * @param type
   * @param callback
   */
  unsubscribeAction (type, callback) {
    if (!this._chartPane.chartData().unsubscribeAction(type, callback)) {
      logWarn('unsubscribeAction', 'type', 'type does not exist!!!')
    }
  }

  /**
   * 获取将图表装换成图片后的url
   * @param includeTooltip
   * @param includeOverlay
   * @param type
   * @param backgroundColor
   */
  getConvertPictureUrl (includeTooltip, includeOverlay, type = 'jpeg', backgroundColor = '#333333') {
    if (type !== 'png' && type !== 'jpeg' && type !== 'bmp') {
      logWarn('getConvertPictureUrl', 'type', 'type only supports jpeg, png and bmp!!!')
      return
    }
    return this._chartPane.getConvertPictureUrl(includeTooltip, includeOverlay, type, backgroundColor)
  }

  /**
   * 销毁
   */
  destroy () {
    this._chartPane.destroy()
  }
}
