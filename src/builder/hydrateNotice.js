import {toast} from 'react-toastify'
import Constants from '../Constants'
import {getHydrateReport} from '../utilities/rosterModel'

import compact from 'lodash/compact'

// Сообщает, если при открытии сохранённого списка пришлось убрать то, чего больше нет в базе (после обновления данных)
export const notifyHydrateReport = () => {
    const report = getHydrateReport()
    if (!report.total) return
    const parts = compact([
        report.units ? `${report.units} unit${report.units > 1 ? 's' : ''}` : '',
        report.detachments ? `${report.detachments} detachment${report.detachments > 1 ? 's' : ''}` : '',
        report.enhancements ? `${report.enhancements} enhancement${report.enhancements > 1 ? 's' : ''}` : ''
    ])
    toast.warn(`The game data was updated. Removed from the list: ${parts.join(', ')}. Check the list before using it.`, {...Constants.toastParams, autoClose: 8000})
}
