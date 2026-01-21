import { Box } from '@mui/material'

interface RocketLogoProps {
  size?: number
}

export function RocketLogo({ size = 64 }: RocketLogoProps) {
  return (
    <Box
      component="img"
      src="/andromeda-icon.png"
      alt="Andromeda"
      sx={{
        width: size,
        height: size,
      }}
    />
  )
}
