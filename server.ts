/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { getFetalWeightReference } from "./src/fetalData.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "15mb" }));

// Lazy instance for GoogleGenAI to prevent crashing at startup if the key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please configuration secrets in the Settings menu.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// REST API for Fetal Growth Assessment
app.post("/api/assess", async (req, res) => {
  const { edd, efw, clientDate } = req.body;

  if (!edd) {
    return res.status(400).json({ error: "Vui lòng cung cấp ngày dự sinh (EDD)." });
  }

  const parsedEfw = Number(efw);
  if (isNaN(parsedEfw) || parsedEfw <= 0) {
    return res.status(400).json({ error: "Vui lòng nhập cân nặng thai nhi ước tính hợp lệ (gam)." });
  }

  try {
    // Determine gestational age: standard full term is 280 days
    const eddDate = new Date(edd);
    const currentDate = clientDate ? new Date(clientDate) : new Date();
    
    // Reset times to midnight to calculate absolute day difference
    eddDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    const timeDiff = eddDate.getTime() - currentDate.getTime();
    const remainingDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    const totalDays = 280 - remainingDays;
    
    if (totalDays < 0) {
      return res.status(400).json({ 
        error: "Ngày dự sinh bạn nhập quá xa hoặc đã trôi qua. Vui lòng kiểm tra lại ngày dự sinh chính xác." 
      });
    }

    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;

    if (weeks < 8 || weeks > 42) {
      return res.status(400).json({
        error: `Chuẩn so sánh cân nặng thai nhi khả dụng cho tuần thai từ 8 đến 42 tuần. Tuần thai tính toán của bạn là ${weeks} tuần. Vui lòng kiểm tra lại ngày dự sinh.`
      });
    }

    // Compare with Hadlock/WHO percentile references
    const ref = getFetalWeightReference(weeks);
    let evaluation: "Thai nhỏ hơn tuổi thai" | "Thai phát triển phù hợp tuổi thai" | "Thai lớn hơn tuổi thai";

    if (parsedEfw < ref.p10) {
      evaluation = "Thai nhỏ hơn tuổi thai";
    } else if (parsedEfw > ref.p90) {
      evaluation = "Thai lớn hơn tuổi thai";
    } else {
      evaluation = "Thai phát triển phù hợp tuổi thai";
    }

    // Call Gemini to generate a highly detailed and friendly report from Dr. Hoai's Perspective representing the clinic
    const ai = getGeminiClient();
    const prompt = `Bạn là Trợ lý Thai kỳ AI đại diện cho Bác sĩ Hoài (BS. Hoài) tại Phòng khám Bác sĩ Biên - Bác sĩ CKI. Huế.
Hãy viết một báo cáo phân tích thai kỳ chuyên nghiệp, cụ thể theo từng mốc tuần thai, vừa mang tính chuyên gia y khoa vừa cực kỳ ấm áp, tin cậy.

Thông tin phân tích:
- Tuổi thai hiện tại: ${weeks} tuần ${days} ngày (Tổng cộng ${totalDays} ngày bầu)
- Cân nặng thai nhi ước tính (EFW): ${parsedEfw} gram
- Kết quả đánh giá lâm sàng: ${evaluation} (Chuẩn tuần thai thứ ${weeks} là - p10: ${ref.p10}g, p50 trung bình: ${ref.p50}g, p90: ${ref.p90}g)

Yêu cầu cấu trúc câu trả lời bắt buộc phải theo định dạng phân phần đúng dưới đây bằng các tiêu đề Markdown:

### 👶 Tuổi thai hiện tại
[Phân tích chi tiết tuần thai hiện tại ${weeks} của mẹ, bé yêu cỡ quả gì, sự phát triển chung giai đoạn này]

### ⚖️ Đánh giá cân nặng thai nhi
[So sánh chi tiết cân nặng thực tế ${parsedEfw}g với khoảng chuẩn bách phân vị p10-p90. Nhắc nhở tích cực, trấn an mẹ hoặc đưa ra khuyến cáo phù hợp theo đánh giá: "${evaluation}"]

### 📈 Nhận xét sự phát triển
[Đưa ra nhận xét lâm sàng giàu yêu thương từ Phòng khám BS. Hoài về sự hoàn thiện hệ tuần hoàn, não bộ, thính giác hay cơ xương của em bé ở tuần ${weeks}]

### 🥗 Chế độ dinh dưỡng phù hợp với tuổi thai hiện tại
[Gợi ý cụ thể thực phẩm và chất dinh dưỡng bổ sung, có nhấn mạnh phù hợp với mức phát triển của bé hiện tại: ${evaluation}. Trình bày đẹp mắt bằng gạch đầu dòng]

### 📅 Các xét nghiệm hoặc mốc khám thai cần lưu ý trong giai đoạn hiện tại
[Chỉ ra chính xác các mốc siêu âm, tiêm vaccine uốn ván, nghiệm pháp dung nạp đường huyết thai kỳ (nếu trong tuần 24-28), xét nghiệm GBS (nếu tuần 35-37) hay lịch khám tương ứng với tuần ${weeks}]

### 🚨 Các dấu hiệu cần đi khám ngay
[Liệt kê rõ ràng và khẩn cấp các dấu hiệu bất thường như ra huyết, đau bụng co thắt, rỉ ối, ra nước âm đạo, thai máy giảm hay không máy...]

Thêm một lời chia sẻ tích cực tạo động lực từ Bác sĩ Hoài ở cuối.
Cuối cùng, bắt buộc in đậm nguyên văn dòng lưu ý y khoa sau để tuân thủ đạo đức nghề nghiệp:
\"Lưu ý: Kết quả phân tích từ Trợ lý AI và bảng chuẩn chỉ mang tính chất tham khảo. Vui lòng trực tiếp tới Phòng khám Bác sĩ Biên - Bác sĩ CKI. Huế hoặc gặp bác sĩ sản khoa của bạn để thăm khám lâm sàng, siêu âm đo đạc chính xác và nhận được tư vấn trực tiếp tốt nhất.\"`;

    // Chuỗi fallback để đảm bảo ứng dụng luôn hoạt động ổn định khi một mô hình quá tải
    const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let reportStream: any = null;
    let lastError: any = null;
    const maxRetries = 1;

    for (const modelName of modelsToTry) {
      let attempts = 0;
      while (attempts < maxRetries) {
        try {
          console.log(`[AI Assessment] Đang thử phân tích STREAM với mô hình: ${modelName}`);
          reportStream = await ai.models.generateContentStream({
            model: modelName,
            contents: prompt,
            config: {
              temperature: 0.7,
            },
          });
          
          if (reportStream) {
            console.log(`[AI Assessment] Tạo dòng STREAM thành công với mô hình: ${modelName}`);
            break;
          }
        } catch (err: any) {
          attempts++;
          lastError = err;
          console.log(`[AI Assessment Alert] Mô hình ${modelName} bận/lỗi STREAM ở lần thử ${attempts}/${maxRetries}: ${err.message || err}`);
        }
      }
      if (reportStream) {
        break; // Hoàn thành xuất sắc, chuyển tiếp kết quả
      }
    }

    if (!reportStream) {
      throw lastError || new Error("Tất cả các dịch vụ AI hiện tại đang quá tải. Vui lòng thử lại sau.");
    }

    // Thiết lập HTTP headers để truyền dữ liệu kiểu Server-Sent Events (SSE)
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Transfer-Encoding", "chunked");

    // Gửi metadata tính toán lập tức lên client
    const metadata = { weeks, days, totalDays, efw: parsedEfw, ref, evaluation };
    res.write(`data: ${JSON.stringify({ type: "metadata", data: metadata })}\n\n`);

    // Gửi từng phần báo cáo trực tiếp (streaming)
    try {
      for await (const chunk of reportStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ type: "chunk", text: chunk.text })}\n\n`);
        }
      }
      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    } catch (streamErr: any) {
      console.log("[AI Assessment Error] Lỗi ghi dòng dữ liệu SSE:", streamErr);
      res.write(`data: ${JSON.stringify({ type: "error", error: "Dòng dữ liệu phân tích bị gián đoạn." })}\n\n`);
    } finally {
      res.end();
    }
  } catch (err: any) {
    console.error("Error in /api/assess:", err);
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: "error", error: err.message || "Đã xảy ra lỗi khi tạo báo cáo." })}\n\n`);
      res.end();
    } else {
      return res.status(500).json({ error: err.message || "Đã xảy ra lỗi hệ thống khi xử lý dữ liệu thai kỳ." });
    }
  }
});

// Setup Vite Dev Server in Development or Serve Static items in Production
if (process.env.NODE_ENV !== "production") {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
