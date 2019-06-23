const Constants = {
  colors: {
    primary: '#6969FF', //6320EE
    primaryWithAlpha: (alpha: number) => `rgba(105, 105, 255, ${alpha})`,
    secondary: '#1B264F',
    dark: '#211A1D', // 211A1D
    darkWithAlpha: (alpha: number) => `rgba(33, 26, 29, ${alpha})`,
    light: '#FFFFFF',
    lightGray: 'rgba(0, 0, 0, 0.08)',
    destructive: '#FC4A49', //8B1E3F
    lightDestructive: 'rgba(252, 74, 73, 0.1)', //8B1E3F
    success: '#7cc452',
    lightSuccess: 'rgba(137, 218, 89, 0.2)',
    destructiveWithAlpha: (alpha: number) => `rgba(252, 74, 73, ${alpha})`,
    graphColorRange: ['#12939A', '#79C7E3', '#1A3177', '#FF9833', '#EF5D28'],
  },
  maxWidth: '1200px',
}

export default Constants
