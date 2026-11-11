import {t} from '../utilities/i18n'
import {toast} from 'react-toastify'
import Constants from '../Constants'
import {getHydrateReport} from '../utilities/rosterModel'

import compact from 'lodash/compact'

// Сообщает, если при открытии сохранённого списка пришлось убрать то, чего больше нет в базе (после обновления данных)
export const notifyHydrateReport = () => {
    const report = getHydrateReport()
    if (!report.total) return
    const parts = compact([
        report.units ? t('{{count}} unit|{{count}} units', {count: report.units}) : '',
        report.detachments ? t('{{count}} detachment|{{count}} detachments', {count: report.detachments}) : '',
        report.enhancements ? t('{{count}} enhancement|{{count}} enhancements', {count: report.enhancements}) : ''
    ])
    toast.warn(t('The game data was updated. Removed from the list: {{parts}}. Check the list before using it.', {parts: parts.join(', ')}), {...Constants.toastParams, autoClose: 8000})
}
