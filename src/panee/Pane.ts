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

import TypeOrNull from '../common/TypeOrNull'
import IUpdater, { UpdateLevel } from '../common/Updater'
import BoundingImp, { Bounding } from '../common/Bounding'

import Axis from '../componentl/Axis'

import DrawWidget from '../widget/DrawWidget'
import SeparatorWidget from '../widget/SeparatorWidget'
import YAxisWidget from '../widget/YAxisWidget'

import ChartInternal from '../ChartInternal'

import { createDom } from '../utils/dom'

export interface PaneOptions {
  id: string
  height?: number
  minHeight?: number
  dragEnabled?: boolean
  gap?: {
    top?: number
    bottom?: number
  }
}

export default abstract class Pane<C extends Axis> implements IUpdater {
  private _container: HTMLElement
  private _seriesContiainer: HTMLElement
  private readonly _id: string
  private readonly _chart: ChartInternal
  private _mainWidget: DrawWidget<C>
  private _yAxisWidget: TypeOrNull<YAxisWidget> = null
  private _separatorWidget: TypeOrNull<SeparatorWidget> = null
  private readonly _axis: C

  private readonly _bounding: BoundingImp = new BoundingImp()

  private _topPane: TypeOrNull<Pane<Axis>>
  private _bottomPane: TypeOrNull<Pane<Axis>>

  private readonly _options: Omit<PaneOptions, 'id' | 'height'> = { dragEnabled: true, gap: { top: 0.2, bottom: 0.1 } }

  constructor (rootContainer: HTMLElement, chart: ChartInternal, id: string, topPane?: Pane<Axis>, bottomPane?: Pane<Axis>) {
    this._chart = chart
    this._id = id
    this._topPane = topPane ?? null
    this._bottomPane = bottomPane ?? null
    this._init(rootContainer)
  }

  private _init (rootContainer: HTMLElement): void {
    this._container = rootContainer
    this._seriesContiainer = createDom('div', {
      width: '100%',
      margin: '0',
      padding: '0',
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box'
    })
    rootContainer.appendChild(this._seriesContiainer)
    this._separatorWidget = this.createSeparatorWidget(rootContainer)
    this._mainWidget = this.createMainWidget(this._seriesContiainer)
    this._yAxisWidget = this.creatYAxisWidget(this._seriesContiainer)
  }

  getId (): string {
    return this._id
  }

  getOptions (): Omit<PaneOptions, 'id' | 'height'> { return this._options }

  getChart (): ChartInternal {
    return this._chart
  }

  getAxisComponent (): C {
    return this._axis
  }

  setBounding (rootBounding: Bounding, mainBounding: Bounding, yAxisBounding: Bounding): Pane<C> {
    this._bounding.merge(rootBounding)
    return this
  }

  getTopPane (): TypeOrNull<Pane<Axis>> {
    return this._topPane
  }

  setTopPane (pane: TypeOrNull<Pane<Axis>>): Pane<C> {
    this._topPane = pane
    return this
  }

  getBottomPane (): TypeOrNull<Pane<Axis>> {
    return this._bottomPane
  }

  setBottomPane (pane: TypeOrNull<Pane<Axis>>): Pane<C> {
    this._bottomPane = pane
    return this
  }

  getMainWidget (): DrawWidget<C> { return this._mainWidget }

  getYAxisWidget (): TypeOrNull<YAxisWidget> { return this._yAxisWidget }

  getSeparatorWidget (): TypeOrNull<SeparatorWidget> { return this._separatorWidget }

  update (level?: UpdateLevel): void {
    const l = level ?? UpdateLevel.DRAWER
    this._mainWidget.update(l)
    this._yAxisWidget?.update(l)
    this._separatorWidget?.update(l)
  }

  destroy (): void {
    this._container.removeChild(this._seriesContiainer)
    if (this._separatorWidget !== null) {
      this._container.removeChild(this._separatorWidget.getContainer())
    }
  }

  abstract getName (): string

  protected abstract createAxisComponent (): C

  protected createSeparatorWidget (container: HTMLElement): TypeOrNull<SeparatorWidget> { return null }

  protected creatYAxisWidget (container: HTMLElement): TypeOrNull<YAxisWidget> { return null }

  protected abstract createMainWidget (container: HTMLElement): DrawWidget<C>
}
