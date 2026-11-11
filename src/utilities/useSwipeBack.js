import {useEffect, useRef} from 'react'
import {useNavigate, useLocation} from 'react-router-dom'
import {isVk} from './platform'

const useSwipeBack = () => {
    const navigate = useNavigate()
    const {pathname} = useLocation()
    const touchStart = useRef(null)
    const threshold = 100; // минимальное расстояние свайпа
    
    useEffect(() => {
        if (pathname !== '/') {
        const handleTouchStart = (e) => {
            // Начинаем отслеживать только от левого края экрана
            if (e.touches[0].clientX < 50) {
            touchStart.current = e.touches[0].clientX
            // В VK жест от левого края по умолчанию закрывает приложение: перехватываем его, чтобы сработал наш возврат
            if (isVk && e.cancelable) e.preventDefault()
            }
        }
    
        const handleTouchMove = (e) => {
            if (touchStart.current === null) return
            if (isVk && e.cancelable) e.preventDefault()
            const currentX = e.touches[0].clientX
            const deltaX = currentX - touchStart.current
            // Свайп справа налево (положительное значение)
            if (deltaX > threshold) {
            navigate(-1);
            touchStart.current = null
            }
        }
    
        const handleTouchEnd = () => {
            touchStart.current = null
        }
    
        document.addEventListener('touchstart', handleTouchStart, {passive: false})
        document.addEventListener('touchmove', handleTouchMove, {passive: false})
        document.addEventListener('touchend', handleTouchEnd)
    
        return () => {
            document.removeEventListener('touchstart', handleTouchStart)
            document.removeEventListener('touchmove', handleTouchMove)
            document.removeEventListener('touchend', handleTouchEnd)
        }
        }
    }, [navigate, pathname])

    return null
}

export default useSwipeBack