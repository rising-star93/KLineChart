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
import Updater, { UpdateLevel } from '../common/Updater'
import Bounding, { BoundingLike } from '../common/Bounding'

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

export default abstract class Pane<C extends Axis> implements Updater {
  private readonly _id: string
  private readonly _chart: ChartInternal
  private _mainWidget: DrawWidget<C>
  private _yAxisWidget: TypeOrNull<YAxisWidget> = null
  private _separatorWidget: TypeOrNull<SeparatorWidget> = null
  private readonly _axis: C

  private readonly _bounding: Bounding = new Bounding()

  private readonly _options: Omit<PaneOptions, 'id' | 'height'> = { dragEnabled: true, gap: { top: 0.2, bottom: 0.1 } }

  constructor (rootContainer: HTMLElement, chart: ChartInternal, id: string) {
    this._id = id
    this._chart = chart
    this._init(rootContainer)
  }

  private _init (rootContainer: HTMLElement): void {
    const seriesContainer = createDom('div', {
      width: '100%',
      margin: '0',
      padding: '0',
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box'
    })
    rootContainer.appendChild(seriesContainer)
    this._separatorWidget = this.createSeparatorWidget(rootContainer)
    this._mainWidget = this.createMainWidget(seriesContainer)
    this._yAxisWidget = this.creatYAxisWidget(seriesContainer)
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

  setBounding (rootBounding: BoundingLike, mainBounding: BoundingLike, yAxisBounding: BoundingLike): Pane<C> {
    this._bounding.merge(rootBounding)
    return this
  }

  getMainWidget (): DrawWidget<C> { return this._mainWidget }

  getYAxisWidget (): TypeOrNull<YAxisWidget> { return this._yAxisWidget }

  getSeparatorWidget (): TypeOrNull<SeparatorWidget> { return this._separatorWidget }

  update (level: UpdateLevel): void {
    this._mainWidget.update(level)
    this._yAxisWidget?.update(level)
    this._separatorWidget?.update(level)
  }

  abstract getName (): string

  protected abstract createAxisComponent (): C

  protected createSeparatorWidget (container: HTMLElement): TypeOrNull<SeparatorWidget> { return null }

  protected creatYAxisWidget (container: HTMLElement): TypeOrNull<YAxisWidget> { return null }

  protected abstract createMainWidget (container: HTMLDivElement): DrawWidget<C>
}
