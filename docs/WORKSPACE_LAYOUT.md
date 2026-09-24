# Workspace layout

Shell của các route sản phẩm `/`, `/chat`, `/settings` hướng đến một ứng dụng desktop tối giản. Navigation ở trái quyết định nội dung chiếm toàn bộ vùng giữa. Không có dải tab cố định cho mọi route. Một feature có thể bổ sung tab có thể đóng khi thực sự có nhiều tài liệu/phiên độc lập; hiện chưa có session thật nên chưa tạo tab giả. [Orca phân biệt tab với pane](https://www.onorca.dev/docs/model/tabs-panes-splits) theo nội dung đang mở; thiết kế này chỉ lấy cách tổ chức làm tham khảo.

## Vùng giao diện

| Vùng | Hiện tại | Quy tắc mở rộng |
| --- | --- | --- |
| Top bar | Một dòng 44px: tên màn, theme switch, nút mở sidebar đang ẩn | Không nhét navigation phụ hoặc status dài vào đây |
| Sidebar trái | Chế độ Tính năng: Sân khấu, Trò chuyện và trạng thái danh sách phiên; chế độ Cài đặt: các mục chia nhóm | Khi có session thật, danh sách phiên thuộc feature hội thoại |
| Avatar ở cuối sidebar | Button mở menu **inline trong sidebar** với Cài đặt, Thông tin ứng dụng và Design system (dev) | Chưa có account nên hiển thị Khách; không dựng popup hoặc hành động tài khoản giả |
| Vùng giữa | `RouterView` chiếm không gian còn lại | Feature sở hữu tab bar riêng nếu có nhiều nội dung cần mở và đóng; không đặt tab route ở shell |
| Sidebar phải | Dải icon 48px; ở Sân khấu có công cụ Thư viện VRMA mở sẵn trên desktop, chứa clip và mix; các công cụ Thông tin, Nhân vật, Giọng nói vẫn mở theo icon | Nội dung điều khiển phụ thuộc route; dữ liệu hội thoại/voice thực đi từ app coordinator khi runtime hoàn thành |
| Status bar | Một dòng 26px: bản xem trước và tình trạng hội thoại | Chỉ dùng trạng thái thật, không giả lập mic/API |

## Tương tác

- Mỗi sidebar có **một nút ẩn/hiện tại một thời điểm**: khi đang mở, nút ở trong sidebar; khi ẩn, nút xuất hiện trên top bar.
- Sidebar trái trong chế độ Cài đặt có nút “Tính năng” quay về feature vừa dùng. Các nhóm Cá nhân hóa và Ứng dụng dùng cùng route `/settings` với query `section`; deep link và refresh giữ đúng mục. `/settings` mặc định mở Giao diện.
- Theme switch là icon nhỏ trên top bar ở mọi route sản phẩm. Trang Giao diện có lựa chọn Sáng/Tối tương ứng. Theme được lưu trong `localStorage`; lần đầu dùng `prefers-color-scheme`.
- Ở viewport ≤ 900px, sidebar mở dạng drawer và chỉ một sidebar xuất hiện cùng lúc. Sidebar đóng dùng `inert`; Escape hoặc backdrop đóng drawer. Menu avatar vẫn nằm trong sidebar.
- Các nút phát chuỗi demo và phát lại màn chào nằm dưới sân khấu trong vùng giữa. Trên màn hình hẹp, Thư viện VRMA mở từ nút ở top bar hoặc nút cạnh tiêu đề Sân khấu; chọn clip hoặc mix đóng drawer để xem nhân vật. Panel và avatar runtime cùng unmount khi rời route.
- Route navigation dùng Vue Router và không giữ view cũ bằng `KeepAlive`. Runtime avatar của Sân khấu dừng RAF/observer và dispose khi unmount; audio khi được port phải làm tương tự.

## Contract cho tab của feature sau này

Khi một feature có nhiều nội dung mở đồng thời (ví dụ nhiều phiên hội thoại), feature đó tự render tab strip **bên trong vùng giữa**. Mỗi tab có ID ổn định, nhãn, nội dung/route và khả năng đóng; tab hiện tại được chỉ rõ bằng `aria-current` hoặc tab semantics phù hợp. Đóng tab chọn tab lân cận còn mở; đóng tab cuối quay về empty state của feature. App shell không sở hữu danh sách tab và không giữ resource của tab đã đóng. State phiên và cách khôi phục sau restart phải được quyết định cùng tính năng lưu hội thoại, không suy ra từ UI placeholder hiện tại.

## Trạng thái triển khai

Shell, navigation cài đặt, theme switch và cấu trúc icon rail đã hoạt động ở F1B. Sân khấu tải VRM cục bộ; thư viện clip/mix được render vào sidebar phải theo route, còn nút demo nằm dưới sân khấu. Trò chuyện vẫn là placeholder. Mục Giao diện và Thông tin có nội dung đang chạy; công cụ Nhân vật dẫn tới Sân khấu nhưng chưa có chọn/đổi model. Giọng nói và Dữ liệu chưa sẵn sàng. Tab có thể đóng, nhiều session, account thật, mic và API chưa được triển khai.

Wishlight tokens và component CSS vẫn là design source. Layout cụ thể dùng scoped CSS tại `frontend/src/app/layouts/AppLayout.vue`; theme state nằm trong `features/settings/composables/useWorkspaceTheme.js`. Design gallery giữ layout riêng chỉ trong dev.
