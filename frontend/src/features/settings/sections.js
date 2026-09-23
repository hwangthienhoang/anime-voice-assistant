export const SETTINGS_GROUPS = Object.freeze([
  {
    label: 'Cá nhân hóa',
    items: [
      { id: 'appearance', label: 'Giao diện', icon: 'sun', description: 'Màu sắc và cách hiển thị không gian làm việc.' },
      { id: 'avatar', label: 'Nhân vật', icon: 'star', description: 'Model VRM và cách nhân vật xuất hiện.' },
      { id: 'voice', label: 'Giọng nói', icon: 'wave', description: 'Giọng đọc và tương tác bằng micro.' },
    ],
  },
  {
    label: 'Ứng dụng',
    items: [
      { id: 'data', label: 'Dữ liệu', icon: 'info', description: 'Lịch sử hội thoại và dữ liệu cá nhân.' },
      { id: 'about', label: 'Thông tin', icon: 'settings', description: 'Thông tin về phiên bản đang phát triển.' },
    ],
  },
]);

export const SETTINGS_SECTIONS = Object.freeze(SETTINGS_GROUPS.flatMap((group) => group.items));
