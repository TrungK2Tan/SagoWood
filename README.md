#SAGO WOOD Social Network

## Giới thiệu

Đây là một dự án Social Network sử dụng công nghệ MERN (MongoDB, Express.js, React, Node.js) kết hợp với Socket.IO để cung cấp tính năng nhắn tin thời gian thực. Ứng dụng cho phép người dùng tạo hồ sơ cá nhân, kết bạn, chia sẻ bài viết và trò chuyện trực tiếp với bạn bè.

## Các tính năng chính

- **Đăng ký và đăng nhập**: Người dùng có thể tạo tài khoản mới hoặc đăng nhập vào hệ thống.
- **Hồ sơ người dùng**: Người dùng có thể xem và chỉnh sửa thông tin cá nhân.
- **Follow**: Người dùng có thể follow lẫn nhau
- **Bài viết**: Người dùng có thể tạo và xem bài viết từ bạn bè.
- **Nhắn tin thời gian thực**: Người dùng có thể trò chuyện với bạn bè qua Socket.IO.

## Kiến trúc dự án

### Backend

- **Node.js**: Nền tảng JavaScript phía máy chủ.
- **Express.js**: Framework ứng dụng web cho Node.js.
- **MongoDB**: Cơ sở dữ liệu NoSQL để lưu trữ dữ liệu người dùng và bài viết.
- **Socket.IO**: Thư viện để thiết lập kết nối WebSocket cho tính năng nhắn tin thời gian thực.

### Frontend

- **React**: Thư viện JavaScript để xây dựng giao diện người dùng.
- **Socket.IO Client**: Thư viện để kết nối với Socket.IO server từ phía client.

## Cài đặt và cấu hình

### Yêu cầu

- Node.js và npm
- MongoDB

## Cách sử dụng

1. **Đăng ký / Đăng nhập**

    Truy cập `http://localhost:3000` để đăng ký hoặc đăng nhập vào hệ thống.

2. **Tạo hồ sơ và follow**

    Sau khi đăng nhập, người dùng có thể tạo hồ sơ cá nhân thêm ảnh đại diện và gửi follow.

3. **thao tác trên bài viết**

    Người dùng có thể tạo và like ,comment , share, saved bài viết với bạn bè.

4. **Nhắn tin**

    Sử dụng tính năng nhắn tin để trò chuyện thời gian thực với bạn bè. Giao diện trò chuyện có thể được truy cập từ trang chính hoặc trang hồ sơ bạn bè.

## API

### Endpoint chính

- `POST /api/register`: Đăng ký người dùng mới.
- `POST /api/login`: Đăng nhập người dùng.
- `GET /api/users/:id`: Lấy thông tin người dùng.
- `POST /api/posts`: Tạo bài viết mới.
- `GET /api/posts`: Lấy danh sách bài viết.

### WebSocket

- **Kết nối**: `/socket.io/`
- **Sự kiện**:
  - `message`: Nhận và gửi tin nhắn.
  - `join`: Tham gia phòng chat.

## Đóng góp

Nếu bạn muốn đóng góp vào dự án, vui lòng tạo một pull request hoặc mở một issue để thảo luận các thay đổi.


---

Cảm ơn bạn đã xem xét dự án của tôi! Nếu có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ.
