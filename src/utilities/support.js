import Constants from '../Constants'

import includes from 'lodash/includes'
import isFinite from 'lodash/isFinite'

const tg = window.Telegram?.WebApp

// Дата последнего доната приходит из поля last_date_of_payment: ISO-строка, 'YYYY-MM-DD HH:MM:SS' или unix-время
const parseDate = (value) => {
    if (!value) {
        return null
    }
    const number = Number(value)
    const date = isFinite(number) ? new Date(number < 1e12 ? number * 1000 : number) : new Date(String(value).replace(' ', 'T'))
    return isNaN(date.getTime()) ? null : date
}

// Поддержка действует месяц с момента последнего доната
export const getSupportUntil = (user) => {
    const paidAt = parseDate(user?.last_date_of_payment)
    if (!paidAt) {
        return null
    }
    const until = new Date(paidAt)
    until.setMonth(until.getMonth() + 1)
    return until
}

export const isSupporter = (user) => {
    const until = getSupportUntil(user)
    return Boolean(until && until > new Date())
}

// Лимит на количество сохранённых списков не действует для разработчиков и подписчиков
export const hasListsLimit = (user, tgId) => !includes(Constants.developersIds, tgId) && !isSupporter(user)

export const formatSupportDate = (date) => date?.toLocaleDateString('en-GB', {day: 'numeric', month: 'long', year: 'numeric'})

export const openSupportPage = () => {
    if (tg) {
        tg.openLink(Constants.supportLinks.telegram)
    } else {
        window.open(Constants.supportLinks.web, '_blank')
    }
}
