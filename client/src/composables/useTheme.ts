import { ref, onMounted, watch } from 'vue'

export function useTheme() {
    const theme = ref(localStorage.getItem('theme') || 'dark')

    const applyTheme = (currentTheme: string) => {
        const body = document.body
        if (currentTheme === 'light') {
            body.classList.add('light-theme')
        } else {
            body.classList.remove('light-theme')
        }
    }

    const toggleTheme = () => {
        theme.value = theme.value === 'light' ? 'dark' : 'light'
        localStorage.setItem('theme', theme.value)
        applyTheme(theme.value)
    }

    watch(theme, (newTheme) => {
        applyTheme(newTheme)
        localStorage.setItem('theme', newTheme)
    })

    onMounted(() => {
        applyTheme(theme.value)
    })

    return {
        theme,
        toggleTheme
    }
}
