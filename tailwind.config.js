/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: { colors: { cyan:'#00f5ff', mag:'#ff2d78', amber:'#ffb800', purple:'#b57bee', bg:'#030712', surf:'#0d1117' }, fontFamily: { display:['Syne','sans-serif'], mono:['Space Mono','monospace'] } } },
  plugins: [],
}
