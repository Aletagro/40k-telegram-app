const params = new URLSearchParams((window.location?.href || '').split('?')[1])

// Запущены внутри приложения ВКонтакте (любая платформа)
export const isVk = params.has('vk_user_id')

// Мобильные клиенты VK рисуют свои кнопки («...» и «×») поверх правого верхнего угла нашей шапки
export const isVkMobile = isVk && (params.get('vk_platform') || '').startsWith('mobile')
