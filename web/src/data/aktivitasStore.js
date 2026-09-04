import { reactive } from 'vue'

// State bersama — siapa pun yang import ini, akan mengacu ke array yang SAMA
export const aktivitasState = reactive({
  daftar: [
    // seed data awal, boleh dikosongkan juga
  ],
})

export function tambahAktivitas(teks) {
  aktivitasState.daftar.unshift({
    id: Date.now(),
    teks,
    waktu: new Date(),
  })
  // batasi biar tidak numpuk tak terbatas
  if (aktivitasState.daftar.length > 50) {
    aktivitasState.daftar.pop()
  }
}