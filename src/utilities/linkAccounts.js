import {main} from './appState'

// Часовые пояса России: по ним определяем, что пользователь Телеграма из России (страна в Telegram недоступна)
const RUSSIAN_TIME_ZONES = [
    'Europe/Kaliningrad', 'Europe/Moscow', 'Europe/Simferopol', 'Europe/Kirov', 'Europe/Volgograd', 'Europe/Astrakhan',
    'Europe/Saratov', 'Europe/Ulyanovsk', 'Europe/Samara', 'Asia/Yekaterinburg', 'Asia/Omsk', 'Asia/Novosibirsk',
    'Asia/Barnaul', 'Asia/Tomsk', 'Asia/Novokuznetsk', 'Asia/Krasnoyarsk', 'Asia/Irkutsk', 'Asia/Chita', 'Asia/Yakutsk',
    'Asia/Khandyga', 'Asia/Vladivostok', 'Asia/Ust-Nera', 'Asia/Magadan', 'Asia/Sakhalin', 'Asia/Srednekolymsk',
    'Asia/Kamchatka', 'Asia/Anadyr'
]

const isRussianTimeZone = () => {
    try {
        return RUSSIAN_TIME_ZONES.includes(Intl.DateTimeFormat().resolvedOptions().timeZone)
    } catch (error) {
        return false
    }
}

// Страна из регистрации в приложении (пользователь вводит её сам)
const isRussianCountry = () => /^(russia|russian federation|россия|рф|rus)$/i.test(String(main.user?.country || '').trim())

// Плитка связки аккаунтов: в ВК показываем всем, в Телеграме только пользователям из России
export const canLinkAccounts = () => {
    // Оба аккаунта уже связаны - плитка не нужна
    if (main.user?.tgId && main.user?.vkId) return false
    if (main.vkId) return true
    return Boolean(main.tgId) && (isRussianTimeZone() || isRussianCountry())
}

export const isVkApp = () => Boolean(main.vkId) && !main.tgId
