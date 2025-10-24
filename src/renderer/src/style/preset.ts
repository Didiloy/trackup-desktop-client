// voir https://github.com/primefaces/primeuix/blob/main/packages/themes/src/presets/aura/base/index.ts pour la liste des éléments que je peux modifier
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

export const TrackupPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{sky.50}',
      100: '{sky.100}',
      200: '{sky.200}',
      300: '{sky.300}',
      400: '{sky.400}',
      500: '{sky.500}',
      600: '{sky.600}',
      700: '{sky.700}',
      800: '{sky.800}',
      900: '{sky.900}',
      950: '{sky.950}'
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '{indigo.50}',
          100: '#B4C3FF',
          200: '#8CBCF2',
          300: '{indigo.300}',
          400: '{indigo.400}',
          500: '{indigo.500}',
          600: '{indigo.600}',
          700: '{indigo.700}',
          800: '{indigo.800}',
          900: '{indigo.900}',
          950: '{indigo.950}'
        }
      },
      dark: {
        surface: {
          0: '{blue.950}',
          50: '{blue.900}',
          100: '{blue.800}',
          200: '{blue.700}',
          300: '{blue.600}',
          400: '{blue.500}',
          500: '{blue.400}',
          600: '{blue.300}',
          700: '{blue.200}',
          800: '{blue.100}',
          900: '{blue.50}',
          950: '#ffffff'
        }
      }
    }
  }
})
