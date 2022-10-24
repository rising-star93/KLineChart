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

import XAxis from '../componentl/XAxis'
import YAxis from '../componentl/YAxis'

import { XAXIS_PANE_ID } from '../ChartInternal'

import View from './View'

export default class GridView extends View<YAxis> {
  protected drawImp (ctx: CanvasRenderingContext2D): void {
    const widget = this.getWidget()
    const pane = this.getWidget().getPane()
    const chart = pane.getChart()
    const bounding = widget.getBounding()

    const gridStyles = chart.getChartStore().getStyleOptions().grid
    const show = gridStyles.show as boolean

    if (show) {
      const horizontalStyles = gridStyles.horizontal
      const horizontalShow = horizontalStyles.show as boolean
      if (horizontalShow) {
        const xAxis = chart.getPaneById(XAXIS_PANE_ID)?.getAxisComponent() as XAxis
        xAxis.getTicks().forEach(tick => {
          this.createFigure('line', {
            coordinates: [
              { x: tick.coord, y: 0 },
              { x: tick.coord, y: bounding.height }
            ],
            styles: {
              style: horizontalStyles.style,
              size: horizontalStyles.size,
              color: horizontalStyles.color,
              dashedValue: horizontalStyles.dashedValue
            }
          })?.draw(ctx)
        })
      }
      const verticalStyles = gridStyles.vertical
      const verticalShow = verticalStyles.show as boolean
      if (verticalShow) {
        const yAxis = pane.getAxisComponent()
        yAxis.getTicks().forEach(tick => {
          this.createFigure('line', {
            coordinates: [
              { x: 0, y: tick.coord },
              { x: bounding.width, y: tick.coord }
            ],
            styles: {
              style: verticalStyles.style,
              size: verticalStyles.size,
              color: verticalStyles.color,
              dashedValue: verticalStyles.dashedValue
            }
          })?.draw(ctx)
        })
      }
    }
  }
}
