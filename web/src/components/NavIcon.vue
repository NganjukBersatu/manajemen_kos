<script>
import { h } from 'vue'

const paths = {
  home: 'M3 10.5L12 4l9 6.5V19a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-8.5z',
  door: 'M6 3h9a1 1 0 011 1v16a1 1 0 01-1 1H6V3zm3 9v.01M18 21V3l3 1v17h-3z',
  users: 'M8 12a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM3 20c.6-3.2 2.9-5 5-5s4.4 1.8 5 5M16.5 12a3 3 0 100-6 3 3 0 000 6zM14.5 20c.5-2.6 2.2-4.2 4-4.7 2 .5 3.7 2.1 4.2 4.7',
  wallet: 'M3 7a2 2 0 012-2h11a2 2 0 012 2v1h1a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm14 6.5a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4z',
  file: 'M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1zM14 3v5h5',
  bolt: 'M13 3L4 14h6l-1 7 9-11h-6l1-7z',
  drop: 'M12 3s7 7.5 7 12a7 7 0 11-14 0c0-4.5 7-12 7-12z',
  wifi: 'M2 8.5a16 16 0 0120 0M5.5 12a11 11 0 0113 0M9 15.5a6 6 0 016 0M12 19v.01',
  receipt: 'M6 2h12v20l-2.5-1.5L13 22l-2.5-1.5L8 22l-2-1.5V2zm2 5h8M8 10h8M8 13h5',
  wrench: 'M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.83 2.83-2-2z',
  chart: 'M4 20V10M10 20V4M16 20v-7M4 20h16',
  gear: 'M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM19.4 13.5a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5V19a2 2 0 11-4 0v-.1a1.6 1.6 0 00-1-1.5 1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H4a2 2 0 110-4h.1a1.6 1.6 0 001.5-1 1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H10a1.6 1.6 0 001-1.5V4a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V10a1.6 1.6 0 001.5 1h.1a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z',
  logout: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  filter: 'M4 5h16M7 12h10M10 19h4',
  search: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3',
  bell: 'M6 8a6 6 0 1112 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6zM9.5 18a2.5 2.5 0 005 0',
  alert: 'M12 9v4M12 17v.01M4.3 18h15.4a1 1 0 00.87-1.5L13 4a1 1 0 00-1.74 0L3.43 16.5A1 1 0 004.3 18z',
  arrowUp: 'M12 19V5M6 11l6-6 6 6',
  chevronRight: 'M9 6l6 6-6 6'
}

export default {
  name: 'NavIcon',
  props: { name: String, small: Boolean, size: Number },
  render() {
    const cls = this.size ? '' : this.small ? 'w-4 h-4 shrink-0' : 'w-[18px] h-[18px] shrink-0'
    const style = this.size ? `width:${this.size}px;height:${this.size}px` : ''
    return h(
      'svg',
      { viewBox: '0 0 24 24', fill: 'none', class: cls, style },
      [h('path', { d: paths[this.name] || '', stroke: 'currentColor', 'stroke-width': 1.7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })]
    )
  }
}
</script>
