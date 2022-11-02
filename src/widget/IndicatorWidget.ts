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

import Pane from '../pane/Pane'

import DrawWidget from './DrawWidget'

import YAxis from '../componentl/YAxis'

import GridView from '../view/GridView'
import IndicatorView from '../view/IndicatorView'
import CrosshairLineView from '../view/CrosshairLineView'
import IndicatorTooltipView from '../view/IndicatorTooltipView'

export default class IndicatorWidget extends DrawWidget<YAxis> {
  private readonly _gridView = new GridView(this)
  private readonly _indicatorView = new IndicatorView(this)
  private readonly _crosshairLineView = new CrosshairLineView(this)
  private readonly _tooltipView = this.createTooltipView()

  constructor (rootContainer: HTMLElement, pane: Pane<YAxis>) {
    super(rootContainer, pane)
    this.registerEvent('mouseMoveEvent', (coordinate) => {
      const chart = pane.getChart()
      chart.getChartContainer().style.cursor = 'crosshair'
      chart.getChartStore().getCrosshairStore().set({ ...coordinate, paneId: pane.getId() })
    })
  }

  protected updateMain (ctx: CanvasRenderingContext2D): void {
    this._gridView.draw(ctx)
    this.updateMainContent(ctx)
    this._indicatorView.draw(ctx)
  }

  protected createTooltipView (): IndicatorTooltipView {
    return new IndicatorTooltipView(this)
  }

  protected updateMainContent (ctx: CanvasRenderingContext2D): void {}

  protected updateOverlay (ctx: CanvasRenderingContext2D): void {
    this._crosshairLineView.draw(ctx)
    this._tooltipView.draw(ctx)
  }
}
