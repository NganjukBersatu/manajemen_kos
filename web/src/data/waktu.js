// src/data/waktu.js
export function formatWaktuRelatif(input) {
  const tanggal = input instanceof Date ? input : new Date(input)
  if (isNaN(tanggal.getTime())) return ''

  const sekarang = new Date()
  const diffMs = sekarang - tanggal
  const diffMenit = Math.floor(diffMs / 60000)

  const jamMenit = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(tanggal)

  if (diffMenit < 1) return 'Baru saja'
  if (diffMenit < 60) return `${diffMenit} menit lalu`

  const isHariIni = tanggal.toDateString() === sekarang.toDateString()
  if (isHariIni) return jamMenit

  const kemarin = new Date(sekarang)
  kemarin.setDate(sekarang.getDate() - 1)
  if (tanggal.toDateString() === kemarin.toDateString()) return `Kemarin, ${jamMenit}`

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    ...(tanggal.getFullYear() !== sekarang.getFullYear() ? { year: 'numeric' } : {}),
  }).format(tanggal)
}