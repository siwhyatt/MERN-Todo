// theme.ts
import { extendTheme, type ThemeConfig, type StyleFunctionProps } from "@chakra-ui/react"

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
}

const theme = extendTheme({
  config,
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        bg: props.colorMode === "dark" ? "gray.800" : "gray.100",
      },
    }),
  },
  components: {
    Heading: {
      baseStyle: {
        textAlign: 'center',
      }
    },
    Input: {
      variants: {
        outline: (props: StyleFunctionProps) => ({
          field: {
            bg: props.colorMode === "light" ? "white" : "gray.700",
          },
        }),
      },
      defaultProps: {
        variant: 'outline',
      },
    },
  },
});

export default theme
