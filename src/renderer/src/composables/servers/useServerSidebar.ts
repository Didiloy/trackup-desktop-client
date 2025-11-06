import { ref } from 'vue'

const visible = ref(false)

export function useServerSidebar() {
  function show(): void {
    visible.value = true
  }
  function hide(): void {
    visible.value = false
  }
  function toggle(): void {
    visible.value = !visible.value
  }
  return { visible, show, hide, toggle }
}
