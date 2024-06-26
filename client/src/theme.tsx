// theme.ts
import { extendTheme, type ThemeConfig } from "@chakra-ui/react"

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: true,
}

const theme = extendTheme({
  config,
  styles: {
    global: (props) => ({
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
        outline: (props) => ({
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
