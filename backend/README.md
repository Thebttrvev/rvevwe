# Revolution Backend

Express + WebSocket server สำหรับ Revolution Check-in App  
เก็บข้อมูลใน Upstash Redis, realtime ด้วย WebSocket

---

## Deploy บน Render

1. Push โฟลเดอร์ `backend/` ขึ้น GitHub repo
2. ไป [render.com](https://render.com) → New → Web Service
3. เลือก repo, ตั้ง **Root Directory** = `backend`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. เพิ่ม Environment Variables:
   - `UPSTASH_REDIS_REST_URL` = URL จาก Upstash console
   - `UPSTASH_REDIS_REST_TOKEN` = Token จาก Upstash console

---

## แก้ URL ใน main.js

หลัง deploy แล้วได้ URL เช่น `https://revolution-backend.onrender.com`  
ให้แก้บรรทัดนี้ใน `main.js`:

```js
const API_BASE = 'https://revolution-backend.onrender.com';
```

หรือเพิ่ม script tag ใน `index.html` ก่อน load `main.js`:

```html
<script>window.API_BASE = 'https://revolution-backend.onrender.com';</script>
```

---

## WebSocket Events (server → client)

| event | data | trigger |
|---|---|---|
| `students` | `{ id: student }` | POST /students |
| `settings` | settings object | POST /settings |
| `online` | `[{id, name, ts}]` | user connect/disconnect |
| `bp_tiers` | tiers object | POST /bp/tiers |
| `bp_free_rewards` | rewards object | POST /bp/free-rewards |
| `bp_claim_rewards` | rewards object | POST /bp/claim-rewards |
| `bp_season_end` | timestamp | POST /bp/season-end |
| `bp_queue_update` | null (refetch) | queue change |
| `shopitems` | items array | shop change |
| `likes` | likes object | like add/delete |
| `chat_{key}` | messages object | new message |
| `chat_meta_{key}` | null = deleted | chat ended |

---

## REST API

| Method | Path | Description |
|---|---|---|
| GET | /students | ดึงนักเรียนทั้งหมด |
| POST | /students | บันทึกนักเรียน (broadcast) |
| GET | /settings | ดึง settings |
| POST | /settings | บันทึก settings (broadcast) |
| GET | /bp/tiers | BP tier config |
| POST | /bp/tiers | บันทึก BP tiers (broadcast) |
| GET | /bp/queue | BP claim queue |
| POST | /bp/queue/:key | เพิ่ม claim |
| PATCH | /bp/queue/:key/status | อัปเดต status |
| DELETE | /bp/queue/:key | ลบ claim |
| GET | /shop | รายการสินค้า |
| POST | /shop/:id | เพิ่ม/แก้ไขสินค้า (broadcast) |
| DELETE | /shop/:id | ลบสินค้า (broadcast) |
| GET | /likes | likes ทั้งหมด |
| POST | /likes/:key | บันทึก like (broadcast) |
| DELETE | /likes/:key | ลบ like (broadcast) |
| DELETE | /likes | ล้าง likes ทั้งหมด |
| DELETE | /swipes | ล้าง swipes |
| GET | /chats/:key | ดึงข้อความแชท |
| POST | /chats/:key/:msgId | ส่งข้อความ (broadcast) |
| DELETE | /chats/:key | ลบแชท (broadcast) |
| GET | /chat-meta/:key | chat metadata |
| POST | /chat-meta/:key | บันทึก chat start time |
