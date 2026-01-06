import { ref, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

type ContextMenuItem = {
    label: string
    icon?: string
    danger?: boolean
    command?: () => void
}

type MenuInstance = {
    show(event: MouseEvent): void
    hide(): void
}

interface MenuWrapper {
    menu: MenuInstance
}

interface ContextMenuProps {
    menu: Ref<MenuWrapper | undefined>
    onRightClick: (event: MouseEvent) => void
    items: ContextMenuItem[]
}

const globalMenu: Ref<MenuWrapper | undefined> = ref()

export function useContextMenu(items: ContextMenuItem[]): ContextMenuProps {
    const menu: Ref<MenuWrapper | undefined> = ref()

    const onRightClick = (event: MouseEvent): void => {
        event.preventDefault()
        if (globalMenu.value && globalMenu.value !== menu.value && globalMenu.value.menu) {
            globalMenu.value.menu.hide()
        }
        globalMenu.value = menu.value
        setTimeout(() => menu.value?.menu?.show(event), 0)
    }

    const closeMenu = (): void => {
        if (menu.value?.menu) {
            menu.value.menu.hide()
        }
    }

    onMounted(() => {
        document.addEventListener('click', closeMenu)
        document.addEventListener('scroll', closeMenu, true)
    })

    onUnmounted(() => {
        document.removeEventListener('click', closeMenu)
        document.removeEventListener('scroll', closeMenu, true)
        if (globalMenu.value === menu.value) {
            globalMenu.value = undefined
        }
    })

    return {
        menu,
        onRightClick,
        items
    }
}
