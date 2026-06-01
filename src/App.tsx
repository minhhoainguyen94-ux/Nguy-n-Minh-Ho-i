/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Baby, 
  Calendar, 
  Scale, 
  Apple, 
  AlertCircle, 
  FileText, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  CheckCircle,
  HelpCircle,
  Phone,
  MapPin,
  RefreshCw,
  Heart
} from "lucide-react";
import { getFetalWeightReference } from "./fetalData";
import { AssessmentResult } from "./types";

const getApiUrl = (endpoint: string): string => {
  const isLocalOrPlatform = 
    window.location.hostname === "localhost" || 
    window.location.hostname === "127.0.0.1" || 
    window.location.hostname.endsWith(".run.app") ||
    window.location.hostname.endsWith(".google.app") ||
    window.location.hostname.endsWith(".web.app");
  
  if (isLocalOrPlatform) {
    return endpoint;
  }
  // Fallback to the live Cloud Run backend container hosting the actual Node backend with the API keys
  return `https://ais-pre-carkrevtgniuuhemj4zgse-704785064573.asia-southeast1.run.app${endpoint}`;
};

// Dynamic fruits database for pregnancy weeks
const FRUITS_BY_WEEK: { [key: number]: { name: string; icon: string; size: string; desc: string } } = {
  8: { name: "Quả mâm xôi (Raspberry)", icon: "🍓", size: "1.6 cm", desc: "Bé yêu bắt đầu hình thành các ngón tay và ngón chân nhỏ xíu." },
  9: { name: "Quả nho (Grape)", icon: "🍇", size: "2.3 cm", desc: "Tim thai đã chia thành 4 ngăn rõ rệt, đuôi phôi đã biến mất." },
  10: { name: "Quả quất (Kumquat)", icon: "🍊", size: "3.1 cm", desc: "Các cơ quan quan trọng như não, thận, ruột bắt đầu hoạt động." },
  11: { name: "Quả sung (Fig)", icon: "🥯", size: "4.1 cm", desc: "Bé đã biết hoạt động tay chân nhịp nhàng dù mẹ chưa cảm nhận được." },
  12: { name: "Quả chanh ta (Lime)", icon: "🍋", size: "5.4 cm", desc: "Các móng tay bắt đầu phát triển, bé có phản xạ mút tay." },
  13: { name: "Quả chanh vàng (Lemon)", icon: "🍋", size: "7.4 cm", desc: "Mẹ bước sang tam cá nguyệt thứ 2, các vân tay của bé được hình thành." },
  14: { name: "Quả đào (Peach)", icon: "🍑", size: "8.7 cm", desc: "Bé đã có thể biểu cảm khuôn mặt như nhăn mặt, cau mày." },
  15: { name: "Quả táo (Apple)", icon: "🍎", size: "10.1 cm", desc: "Lớp da mỏng manh của bé được bao phủ bởi một lớp lông tơ mềm mại." },
  16: { name: "Quả bơ (Avocado)", icon: "🥑", size: "11.6 cm", desc: "Hệ xương khớp cứng cáp hơn, mắt đã có nhịp cử động chậm dưới mí." },
  17: { name: "Quả lựu (Pomegranate)", icon: "🍅", size: "13.0 cm", desc: "Các khớp của bé di chuyển linh hoạt, tuyến mỡ dưới da phát triển." },
  18: { name: "Quả khoai tây (Potato)", icon: "🥔", size: "14.2 cm", desc: "Bé đã nghe thấy tiếng tim mẹ đập và các âm thanh từ bên ngoài." },
  19: { name: "Quả xoài (Mango)", icon: "🥭", size: "15.3 cm", desc: "Các vùng giác quan của não bộ đang phát triển mạnh mẽ." },
  20: { name: "Quả chuối (Banana)", icon: "🍌", size: "25.6 cm", desc: "Bé đã phát triển chất gây bảo vệ làn da trong môi trường nước ối." },
  21: { name: "Quả cà rốt (Carrot)", icon: "🥕", size: "26.7 cm", desc: "Hệ tiêu hóa của bé bắt đầu hấp thụ một lượng nhỏ nước ối." },
  22: { name: "Quả đu đủ nhỏ (Papaya)", icon: "🍐", size: "27.8 cm", desc: "Bé trông giống một em bé sơ sinh thu nhỏ, môi và mắt rõ rệt hơn." },
  23: { name: "Quả bưởi chùm (Grapefruit)", icon: "🍊", size: "28.9 cm", desc: "Hệ hô hấp phát triển, bé tập các nhịp thở nấc đầu tiên." },
  24: { name: "Quả dưa gang (Cantaloupe)", icon: "🍉", size: "30.0 cm", desc: "Các túi phổi bắt đầu sản xuất chất hoạt diện giúp phổi nở ra sau sinh." },
  25: { name: "Quả súp lơ (Cauliflower)", icon: "🥦", size: "34.6 cm", desc: "Da bớt nhăn nheo hơn nhờ lớp mỡ tiếp tục tích tụ." },
  26: { name: "Quả xà lách (Lettuce)", icon: "🥬", size: "35.6 cm", desc: "Mắt bé bắt đầu mở ra, bé học cách chớp mắt điều tiết." },
  27: { name: "Quả bắp cải (Cabbage)", icon: "🥬", size: "36.6 cm", desc: "Chu kỳ ngủ và thức của bé trở nên rõ ràng và ổn định hơn." },
  28: { name: "Quả dừa (Coconut)", icon: "🥥", size: "37.6 cm", desc: "Não bộ hoàn thiện hàng tỷ neuron thần kinh liên kết." },
  29: { name: "Bí ngòi hạt đào (Butternut)", icon: "🍠", size: "38.6 cm", desc: "Cơ bắp và phổi tiếp tục phát triển hoàn thiện chuẩn bị chào đời." },
  30: { name: "Quả dưa hấu nhỏ (Cantaloupe)", icon: "🍈", size: "39.9 cm", desc: "Trí não phát triển vượt bậc, bé cảm nhận ánh sáng tốt hơn." },
  31: { name: "Quả dứa (Pineapple)", icon: "🍍", size: "41.1 cm", desc: "Bé có thể quay đầu từ bên này sang bên kia để khám phá." },
  32: { name: "Bắp cải Napa (Napa Cabbage)", icon: "🥬", size: "42.4 cm", desc: "Lớp lông tơ bảo vệ bắt đầu rụng dần chuẩn bị cho ngày sinh." },
  33: { name: "Sầu riêng nhỏ (Durian)", icon: "🍈", size: "43.7 cm", desc: "Xương sọ của bé vẫn mềm dẻo để dễ chui lọt qua đường sinh thường." },
  34: { name: "Quả dưa lưới (Cantaloupe)", icon: "🍈", size: "45.0 cm", desc: "Hệ miễn dịch của bé được củng cố nhờ kháng thể từ mẹ." },
  35: { name: "Quả dừa lớn (Large Coconut)", icon: "🥥", size: "46.2 cm", desc: "Phổi và hệ tiêu hóa của bé gần như đã hoạt động hoàn chỉnh." },
  36: { name: "Quả mít nhỏ (Jackfruit)", icon: "🍉", size: "47.4 cm", desc: "Bé tích mỡ đầy đặn ở má, tay, chân tạo má bầu bĩnh đáng yêu." },
  37: { name: "Quả đu đủ lớn (Large Papaya)", icon: "🥭", size: "48.6 cm", desc: "Bé được coi là đủ tháng sớm, sẵn sàng chào đời bất cứ lúc nào." },
  38: { name: "Quả bí đỏ lớn (Pumpkin)", icon: "🎃", size: "49.8 cm", desc: "Lớp mỡ dưới da chiếm khoảng 15% trọng lượng cơ thể bé." },
  39: { name: "Quả dưa hấu lớn (Watermelon)", icon: "🍉", size: "50.7 cm", desc: "Các phản xạ phối hợp nhịp nhàng, lực bú của bé đã rất khỏe." },
  40: { name: "Quả mít lớn (Large Jackfruit)", icon: "🍉", size: "51.2 cm", desc: "Mốc dự sinh chính thức! Chúc mừng mẹ đã hoàn thành hành trình xuất sắc." },
  41: { name: "Bí đỏ khổng lồ", icon: "🎃", size: "51.7 cm", desc: "Bé đang chờ thêm một chút dưỡng chất, mẹ hãy theo dõi sát thai máy nhé." },
  42: { name: "Bí ngô khổng lồ", icon: "🎃", size: "52.2 cm", desc: "Lưu ý mốc quá ngày sinh, thăm khám thường xuyên theo khuyên tai của BS. Hoài." }
};

const LOADING_QUOTES = [
  "Bác sĩ Hoài khuyên mẹ bổ sung canxi & vitamin D3 từ giờ để hỗ trợ hệ cơ & khung xương bé phát triển tối ưu.",
  "Mẹ bầu lưu ý duy trì chế độ ăn nhạt lành mạnh, uống đủ nước ấm để dự phòng các cơn phù nề cơ thể.",
  "Hãy theo dõi đếm cử động thai (thai máy) đều đặn từ tuần 28 trở đi, tối thiểu 4 lần trong ngày mẹ nhé.",
  "Hạn chế các nhóm tinh bột tinh luyện nhiều đường, tăng cường protein nạc chất lượng tốt từ ức gà, thịt thịt bò.",
  "Uống nước dừa có nhiều kali, mẹ nên uống khoảng 2-3 trái mỗi tuần từ tam cá nguyệt thứ 2 để duy trì ối trong trẻo.",
  "Kích thước trí não và các synapse thần kinh của bé yêu đang kết nối cực kỳ nhanh chóng trong từng giây phút.",
  "Một bữa ăn sạch giàu canxi, sắt và acid folic của mẹ chính là món quà tốt nhất bảo bọc tương lai tươi sáng của con."
];

function getIconForLine(line: string, defaultIcon: string = "✨"): string {
  const normalized = line.toLowerCase();
  
  // Dinh dưỡng tẩm bổ
  if (normalized.includes("canxi") || normalized.includes("sữa") || normalized.includes("sữa bầu") || normalized.includes("phô mai") || normalized.includes("sữa chua")) return "🥛";
  if (normalized.includes("sắt") || normalized.includes("thịt bò") || normalized.includes("thịt đỏ") || normalized.includes("gan") || normalized.includes("heo") || normalized.includes("bổ máu") || normalized.includes("đỏ")) return "🥩";
  if (normalized.includes("trứng") || normalized.includes("đạm") || normalized.includes("protein") || normalized.includes("gà") || normalized.includes("đậu nành")) return "🥚";
  if (normalized.includes("cá") || normalized.includes("tôm") || normalized.includes("hải sản") || normalized.includes("omega")) return "🐟";
  if (normalized.includes("acid folic") || normalized.includes("folate") || normalized.includes("rau xanh") || normalized.includes("bông cải") || normalized.includes("măng tây") || normalized.includes("xà lách") || normalized.includes("rau chân vịt") || normalized.includes("rau")) return "🥬";
  if (normalized.includes("nước") || normalized.includes("uống nước") || normalized.includes("nước lọc") || normalized.includes("nước dừa") || normalized.includes("đủ nước") || normalized.includes("nước ối")) return "💧";
  if (normalized.includes("vitamin") || normalized.includes("trái cây") || normalized.includes("quả") || normalized.includes("táo") || normalized.includes("cam") || normalized.includes("bưởi") || normalized.includes("quýt") || normalized.includes("chuối") || normalized.includes("bơ")) return "🍎";
  if (normalized.includes("hạt") || normalized.includes("óc chó") || normalized.includes("hạnh nhân") || normalized.includes("điều") || normalized.includes("mắc ca")) return "🥜";
  if (normalized.includes("muối") || normalized.includes("i-ốt") || normalized.includes("mặn") || normalized.includes("ăn nhạt")) return "🧂";
  if (normalized.includes("đường") || normalized.includes("ngọt") || normalized.includes("bánh kẹo") || normalized.includes("tiểu đường") || normalized.includes("glucozo")) return "🍬";
  if (normalized.includes("tinh bột") || normalized.includes("gạo lức") || normalized.includes("khoai lang") || normalized.includes("yến mạch")) return "🍠";

  // Khám thai / Xét nghiệm
  if (normalized.includes("siêu âm") || normalized.includes("4d") || normalized.includes("5d") || normalized.includes("2d") || normalized.includes("mơ da gáy") || normalized.includes("do dac")) return "🔍";
  if (normalized.includes("xét nghiệm") || normalized.includes("máu") || normalized.includes("nước tiểu") || normalized.includes("nipt") || normalized.includes("double test") || normalized.includes("triple test") || normalized.includes("gbs")) return "🧪";
  if (normalized.includes("uốn ván") || normalized.includes("tiêm phòng") || normalized.includes("tiêm ngừa") || normalized.includes("vaccine") || normalized.includes("mũi") || normalized.includes("tiêm")) return "💉";
  if (normalized.includes("dung nạp đường") || normalized.includes("nghiệm pháp") || normalized.includes("đường huyết")) return "📊";
  if (normalized.includes("lịch khám") || normalized.includes("mốc khám") || normalized.includes("khám thai") || normalized.includes("khám định kỳ") || normalized.includes("đúng hẹn") || normalized.includes("hẹn")) return "📅";
  if (normalized.includes("bác sĩ") || normalized.includes("bác sĩ hoài") || normalized.includes("phòng khám") || normalized.includes("tư vấn") || normalized.includes("khám") || normalized.includes("lâm sàng")) return "🩺";

  // Cảnh báo / Dấu hiệu nguy cơ
  if (normalized.includes("đau bụng") || normalized.includes("co thắt") || normalized.includes("gò") || normalized.includes("cơn co") || normalized.includes("đau quặn")) return "⚡";
  if (normalized.includes("ra máu") || normalized.includes("chảy máu") || normalized.includes("huyết") || normalized.includes("âm đạo") || normalized.includes("dịch đỏ")) return "🛑";
  if (normalized.includes("rỉ ối") || normalized.includes("vỡ ối") || normalized.includes("ra nước")) return "💧";
  if (normalized.includes("sốt") || normalized.includes("nóng") || normalized.includes("mệt mỏi") || normalized.includes("lạnh")) return "🌡️";
  if (normalized.includes("đau đầu") || normalized.includes("chóng mặt") || normalized.includes("mờ mắt") || normalized.includes("phù")) return "🌀";
  if (normalized.includes("thai máy") || normalized.includes("đạp") || normalized.includes("cử động") || normalized.includes("đếm nhịp")) return "👣";
  if (normalized.includes("nguy hiểm") || normalized.includes("cấp cứu") || normalized.includes("ngay") || normalized.includes("ngay lập tức") || normalized.includes("bất thường")) return "🚨";

  // Sự phát triển của bé
  if (normalized.includes("não") || normalized.includes("tế bào thần kinh") || normalized.includes("hệ thần kinh") || normalized.includes("trí tuệ") || normalized.includes("tư duy")) return "🧠";
  if (normalized.includes("tim") || normalized.includes("nhịp tim") || normalized.includes("tuần hoàn") || normalized.includes("mạch")) return "❤️";
  if (normalized.includes("xương") || normalized.includes("khớp") || normalized.includes("chiều dài") || normalized.includes("cao") || normalized.includes("móng") || normalized.includes("răng")) return "🦴";
  if (normalized.includes("tai") || normalized.includes("nghe") || normalized.includes("âm thanh") || normalized.includes("thính giác")) return "👂";
  if (normalized.includes("mắt") || normalized.includes("nhìn") || normalized.includes("ánh sáng") || normalized.includes("thị giác") || normalized.includes("mí") || normalized.includes("mở mắt")) return "👁️";
  if (normalized.includes("phổi") || normalized.includes("thở") || normalized.includes("hô hấp") || normalized.includes("nấc")) return "🫁";
  if (normalized.includes("da") || normalized.includes("mỡ") || normalized.includes("lông tơ") || normalized.includes("sáp") || normalized.includes("vân tay")) return "✨";

  return defaultIcon;
}

export default function App() {
  // Fetal Growth Assessment States
  const [edd, setEdd] = useState<string>("");
  const [efw, setEfw] = useState<string>("");
  const [assessLoading, setAssessLoading] = useState<boolean>(false);
  const [assessResult, setAssessResult] = useState<AssessmentResult | null>(null);
  const [assessError, setAssessError] = useState<string | null>(null);
  
  // Interactive Slider Week State (for general comparison)
  const [explorerWeek, setExplorerWeek] = useState<number>(20);
  
  // Loading status rotating quote index
  const [quoteIndex, setQuoteIndex] = useState<number>(0);

  // New States for dynamic chart viewport & realistic processing delay
  const [isZoomed, setIsZoomed] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  // AI Q&A States
  const [qaQuestion, setQaQuestion] = useState<string>("");
  const [qaAnswer, setQaAnswer] = useState<string>("");
  const [qaLoading, setQaLoading] = useState<boolean>(false);
  const [qaError, setQaError] = useState<string | null>(null);

  // Question Submission handles Fetal Q&A Consultation Stream
  const handleAskSubmit = async (customQ?: string, currentW?: number) => {
    const finalQuestion = customQ || qaQuestion;
    if (!finalQuestion || !finalQuestion.trim()) {
      setQaError("Vui lòng nhập câu hỏi thăm vấn của bạn.");
      return;
    }

    setQaError(null);
    setQaLoading(true);
    setQaAnswer("");

    try {
      const response = await fetch(getApiUrl("/api/ask"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: finalQuestion,
          week: currentW || (assessResult ? assessResult.weeks : explorerWeek)
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Gửi câu hỏi thất bại.");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Không thể khởi tạo luồng dữ liệu Q&A.");
      }

      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let accumulatedAnswer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.type === "chunk") {
              accumulatedAnswer += parsed.text;
              setQaAnswer(accumulatedAnswer);
            } else if (parsed.type === "error") {
              setQaError(parsed.error);
            }
          } catch (e) {
            console.error("Lỗi parse SSE:", e);
          }
        }
      }
    } catch (err: any) {
      console.error("Lỗi khi hỏi đáp:", err);
      setQaError(err.message || "Đã xảy ra lỗi hệ thống khi kết nối tới Trợ lý AI.");
    } finally {
      setQaLoading(false);
    }
  };

  const renderQaAnswer = (text: string) => {
    if (!text) return null;
    return (
      <div className="space-y-2 text-stone-750 text-xs sm:text-sm leading-relaxed whitespace-pre-line" id="qa-rendered-answer">
        {text.split("\n").map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-2" />;
          
          let cleanLine = line.trim();
          const isBullet = cleanLine.startsWith("-") || cleanLine.startsWith("*") || cleanLine.startsWith("•");
          if (isBullet) {
            cleanLine = cleanLine.replace(/^[-*•]\s*/, "");
          }

          // Parse **bold** parts into <strong> elements
          const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
          const lineElements = parts.map((part, pIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={pIdx} className="font-extrabold text-stone-900">{part.slice(2, -2)}</strong>;
            }
            return part;
          });

          if (isBullet) {
            const bulletIcon = getIconForLine(cleanLine);
            return (
              <div key={idx} className="flex items-start gap-2 pl-2 mt-1.5">
                <span className="text-base select-none shrink-0" role="img">{bulletIcon}</span>
                <span className="flex-1 mt-0.5">{lineElements}</span>
              </div>
            );
          }

          return (
            <p key={idx} className="font-medium text-stone-850 mt-1">
              {lineElements}
            </p>
          );
        })}
      </div>
    );
  };

  const renderPregnancyQASection = (customClass = "") => {
    const presets = [
      {
        tag: "Dinh dưỡng",
        q: "Nên ăn những gì ở tuần thai thứ 12 để tối ưu phát triển não bộ và thần kinh cho bé yêu?",
        short: "Tuần 12: Ăn gì bổ não?"
      },
      {
        tag: "Tiểu đường",
        q: "Chế độ dinh dưỡng ăn kiêng khoa học phòng ngừa tiểu đường thai kỳ ở tuần thai 24 - 28?",
        short: "Tuần 24-28: Phòng tiểu đường?"
      },
      {
        tag: "Nhẹ cân",
        q: "Tuần thai thứ 32 siêu âm thấy bé nhẹ cân so với bách phân vị chuẩn, mẹ nên bồi bổ thực đơn gì?",
        short: "Tuần 32: Bé nhẹ cân bồi bổ gì?"
      },
      {
        tag: "Sức khỏe",
        q: "Cơ thể bị chuột rút và tê tay chân ở tuần thai 20 là thiếu chất gì? Gợi ý thực đơn bổ sung?",
        short: "Tuần 20: Tê chân tay thiếu chất gì?"
      },
      {
        tag: "Vượt cạn",
        q: "Dấu hiệu chuyển dạ cần đi viện ngay ở tuần thai thứ 36+ và chế độ dinh dưỡng giữ sức?",
        short: "Tuần 36+: Chuẩn bị vượt cạn?"
      }
    ];

    return (
      <div className={`bg-white rounded-3xl border border-stone-100 p-6 shadow-sm space-y-5 ${customClass}`} id="pregnancy-qa-block">
        <div className="flex items-center space-x-2.5 border-b border-stone-100 pb-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#1A3A34] shadow-sm shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-[#1A3A34] text-xs sm:text-sm">Hỏi Đáp Thai Kỳ AI cùng BS. Hoài</h4>
            <p className="text-[10px] text-stone-400">Tham vấn dinh dưỡng thai sản, chế độ dinh dưỡng, xét nghiệm chuẩn y khoa</p>
          </div>
        </div>

        {/* Dynamic Preset Cards */}
        <div className="space-y-2">
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Mẹ bầu hay hỏi (Click để hỏi BS ngay):</p>
          <div className="flex flex-wrap gap-1.5" id="qa-presets-list">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQaQuestion(preset.q);
                  handleAskSubmit(preset.q);
                }}
                disabled={qaLoading}
                className="text-left px-3 py-2 rounded-xl text-stone-700 bg-[#FCFAF7] hover:bg-orange-50/50 hover:text-orange-950 border border-stone-200/60 hover:border-orange-200 text-[11px] transition-all font-semibold max-w-full duration-150 disabled:opacity-50"
              >
                <span className="inline-block text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-100/50 px-1.5 py-0.5 rounded mr-1.5 uppercase shrink-0">
                  {preset.tag}
                </span>
                {preset.short}
              </button>
            ))}
          </div>
        </div>

        {/* Ask Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskSubmit();
          }}
          className="space-y-3.5"
          id="qa-input-form"
        >
          <div className="relative">
            <textarea
              value={qaQuestion}
              onChange={(e) => setQaQuestion(e.target.value)}
              placeholder="Đặt bất kỳ câu hỏi nào cho Bác sĩ (Ví dụ: Chế độ dinh dưỡng tuần 16, các mốc xét nghiệm cần lưu ý...)"
              required
              rows={2}
              className="w-full pl-4 pr-12 py-3 bg-stone-50/50 focus:bg-white rounded-xl border border-stone-200 text-stone-900 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-400 resize-none"
              id="qa-question-field"
            />
            <button
              type="submit"
              disabled={qaLoading || !qaQuestion.trim()}
              className="absolute right-2.5 bottom-3.5 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all disabled:opacity-40 disabled:pointer-events-none shadow-sm flex items-center justify-center shrink-0"
              title="Gửi câu hỏi"
              id="btn-submit-qa"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {qaError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-800 text-[11px] font-semibold" id="qa-error-box">
            {qaError}
          </div>
        )}

        {/* Show active streaming answers */}
        {(qaLoading || qaAnswer) && (
          <div className="p-4 rounded-2xl bg-[#FCFAF7] border border-stone-150/80 shadow-inner space-y-3.5 relative overflow-hidden" id="qa-answer-block">
            <div className="flex items-center justify-between border-b border-stone-100/85 pb-2.5">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                Bác sĩ Hoài giải đáp:
              </span>
              {qaLoading && (
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Đang soạn lời khuyên...
                </span>
              )}
            </div>

            <div className="max-h-[350px] overflow-y-auto pr-1">
              {qaAnswer ? (
                renderQaAnswer(qaAnswer)
              ) : (
                <div className="space-y-2 py-1 animate-pulse" id="qa-loading-skeleton">
                  <div className="h-3 bg-stone-200 rounded-full w-3/4"></div>
                  <div className="h-3 bg-stone-200 rounded-full w-5/6"></div>
                  <div className="h-3 bg-stone-200 rounded-full w-2/3"></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Rotating timer quote effect - 15 seconds per message
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % LOADING_QUOTES.length);
    }, 15000); // 15 seconds translation interval for medical cards
    return () => clearInterval(timer);
  }, []);

  // Populate dynamic default EDD (240 days from now as a standard sweet spot)
  useEffect(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 180); // ~6 months in future
    setEdd(defaultDate.toISOString().split("T")[0]);
    setEfw("350"); // default EFW
  }, []);

  // Set explorer week based on computed weeks from assessment
  useEffect(() => {
    if (assessResult) {
      setExplorerWeek(assessResult.weeks);
    }
  }, [assessResult]);

  // Compute local values for explorer week (slider)
  const explorerRef = getFetalWeightReference(explorerWeek);
  const explorerFruit = FRUITS_BY_WEEK[explorerWeek] || { name: "Bé Yêu", icon: "👶", size: "N/A", desc: "Bé yêu đang phát triển từng ngày." };

  // Plot custom SVG Percentile curves coordinates with advanced zoom behavior
  const activeW = assessResult ? assessResult.weeks : explorerWeek;
  
  // Decide viewport range
  let minW = 12;
  let maxW = 40;
  let minY = 0;
  let maxY = 4500;

  if (isZoomed) {
    const startW = Math.max(12, activeW - 3); // Center around active week with standard offset
    const endW = Math.min(42, startW + 7);     // Always keep a clean 8-weeks display span (so standard ticking)
    minW = endW - 7;
    maxW = endW;

    // Weight range corresponding to this zoomed-in week range
    const refMin = getFetalWeightReference(minW);
    const refMax = getFetalWeightReference(maxW);

    // Let's set minY & maxY to focus precisely
    const rawMinY = Math.max(0, refMin.p10 * 0.75);
    minY = Math.max(0, Math.floor(rawMinY / 50) * 50);

    let rawMaxY = refMax.p90 * 1.25;
    // ensure baby's estimated weight fits too if plotted
    if (assessResult) {
      if (assessResult.efw > rawMaxY) {
        rawMaxY = assessResult.efw * 1.25;
      }
      if (assessResult.efw < rawMinY) {
        minY = Math.max(0, Math.floor((assessResult.efw * 0.70) / 50) * 50);
      }
    }
    maxY = Math.max(minY + 200, Math.ceil(rawMaxY / 50) * 50);
  }

  const plotWidth = 520;
  const plotHeight = 300;
  const paddingLeft = 55;
  const paddingRight = 25; // slightly wider padding to handle labels cleanly
  const paddingTop = 25;
  const paddingBottom = 40;

  const mapX = (week: number) => {
    return paddingLeft + ((week - minW) / (maxW - minW)) * (plotWidth - paddingLeft - paddingRight);
  };

  const mapY = (weight: number) => {
    return (plotHeight - paddingBottom) - ((weight - minY) / (maxY - minY)) * (plotHeight - paddingBottom - paddingTop);
  };

  // Compile full weeks list for graph points
  const graphWeeks = Array.from({ length: maxW - minW + 1 }, (_, i) => minW + i);
  const graphPoints = graphWeeks.map(w => {
    const ref = getFetalWeightReference(w);
    return { week: w, ...ref };
  });

  // SVG Area Paths
  const p10Points = graphPoints.map(p => `${mapX(p.week)},${mapY(p.p10)}`).join(" ");
  const p90PointsRev = [...graphPoints].reverse().map(p => `${mapX(p.week)},${mapY(p.p90)}`).join(" ");
  const zonePoints = `${p10Points} ${p90PointsRev}`;

  const p10LinePath = graphPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${mapX(p.week)} ${mapY(p.p10)}`).join(" ");
  const p50LinePath = graphPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${mapX(p.week)} ${mapY(p.p50)}`).join(" ");
  const p90LinePath = graphPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${mapX(p.week)} ${mapY(p.p90)}`).join(" ");

  // Form Submission handles Fetal Assessment APIs
  const handleAssessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssessError(null);

    const parsedEfw = parseFloat(efw);
    if (isNaN(parsedEfw) || parsedEfw <= 0) {
      setAssessError("Vui lòng nhập cân nặng thai nhi hợp lệ (gam).");
      return;
    }

    // Reset progress and turn on the beautiful 5s loading analyzer
    setLoadingProgress(0);
    setAssessLoading(true);

    try {
      const eddDate = new Date(edd);
      const currentDate = new Date();
      
      eddDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);

      const timeDiff = eddDate.getTime() - currentDate.getTime();
      const remainingDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      const totalDays = 280 - remainingDays;

      if (totalDays < 0) {
        setAssessError("Ngày dự sinh bạn nhập quá xa hoặc đã trôi qua. Vui lòng kiểm tra lại ngày dự sinh chính xác.");
        setAssessLoading(false);
        return;
      }

      const weeks = Math.floor(totalDays / 7);
      const days = totalDays % 7;

      if (weeks < 8 || weeks > 42) {
        setAssessError(`Bách phân vị Hadlock khả dụng từ tuần 8 đến 42. Tuần thai của bạn tính toán là ${weeks} tuần. Vui lòng kiểm tra lại ngày dự sinh.`);
        setAssessLoading(false);
        return;
      }

      const ref = getFetalWeightReference(weeks);
      let evaluation: "Thai nhỏ hơn tuổi thai" | "Thai phát triển phù hợp tuổi thai" | "Thai lớn hơn tuổi thai";

      if (parsedEfw < ref.p10) {
        evaluation = "Thai nhỏ hơn tuổi thai";
      } else if (parsedEfw > ref.p90) {
        evaluation = "Thai lớn hơn tuổi thai";
      } else {
        evaluation = "Thai phát triển phù hợp tuổi thai";
      }

      const clientDateString = new Date().toISOString().split("T")[0];

      // Gửi yêu cầu API và chạy hiệu ứng thanh tiến trình chẩn đoán y khoa song song
      const apiPromise = fetch(getApiUrl("/api/assess"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          edd,
          efw: parsedEfw,
          clientDate: clientDateString
        })
      });

      let currentProgress = 0;
      const progressPromise = new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          currentProgress += 2;
          setLoadingProgress(Math.min(100, currentProgress));
          if (currentProgress >= 100) {
            clearInterval(interval);
            resolve();
          }
        }, 60); // Đặt chính xác 3 giây (50 bước * 60ms) theo yêu cầu tải báo cáo y khoa của bác sĩ
      });

      // Đợi phản hồi API kết nối xong
      const response = await apiPromise;
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Gửi yêu cầu phân tích thất bại.");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Không thể khởi tạo luồng dữ liệu.");
      }

      // Chờ thanh tiến trình hoàn tất để tạo hiệu ứng mượt mà
      await progressPromise;

      // Chuyển màn hình sang kết quả lập tức để hiển thị đồ thị và bách phân vị
      setIsZoomed(true);
      setAssessLoading(false);

      // Thiết lập dữ liệu đo đạc cơ bản trước để vẽ biểu đồ bách phân vị Hadlock tức thời
      setAssessResult({
        weeks,
        days,
        totalDays,
        efw: parsedEfw,
        ref,
        evaluation,
        report: ""
      });

      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let accumulatedReport = "";

      // Đọc luồng dữ liệu (streaming) từ Gemini và hiển thị từ từ từng dòng
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        // Giữ lại dòng cuối chưa hoàn chỉnh trong buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.type === "chunk") {
              accumulatedReport += parsed.text;
              setAssessResult(prev => {
                if (!prev) return null;
                return {
                  ...prev,
                  report: accumulatedReport
                };
              });
            } else if (parsed.type === "metadata") {
              const meta = parsed.data;
              setAssessResult(prev => {
                if (!prev) return null;
                return {
                  ...prev,
                  ...meta,
                  report: prev.report || ""
                };
              });
            } else if (parsed.type === "error") {
              setAssessError(parsed.error);
            }
          } catch (e) {
            console.error("Lỗi phân tích cú pháp SSE line:", e);
          }
        }
      }
    } catch (err: any) {
      setAssessError(err.message || "Không thể kết nối đến máy chủ.");
    } finally {
      setAssessLoading(false);
    }
  };



  // Split and parse output report from Doctor Bien's AI
  const renderReportCards = (reportText: string) => {
    const sections: { [key: string]: { title: string; content: string; icon: string; style: string } } = {
      tuoi_thai: { 
        title: "Tuổi thai hiện tại", 
        content: "", 
        icon: "👶", 
        style: "bg-orange-50/70 border-orange-200 text-orange-950" 
      },
      danh_gia: { 
        title: "Đánh giá cân nặng thai nhi", 
        content: "", 
        icon: "⚖️", 
        style: "bg-emerald-50/70 border-emerald-200 text-emerald-950"
      },
      nhan_xet: { 
        title: "Nhận xét sự phát triển từ BS. Hoài", 
        content: "", 
        icon: "📈", 
        style: "bg-sky-50/70 border-sky-200 text-sky-950"
      },
      dinh_duong: { 
        title: "Chế độ dinh dưỡng phù hợp", 
        content: "", 
        icon: "🥗", 
        style: "bg-green-50/70 border-green-200 text-green-950"
      },
      xet_nghiem: { 
        title: "Các xét nghiệm & mốc khám cần lưu ý", 
        content: "", 
        icon: "📅", 
        style: "bg-indigo-50/70 border-indigo-200 text-indigo-950"
      },
      dau_hieu: { 
        title: "Các dấu hiệu cảnh báo cần đi khám ngay", 
        content: "", 
        icon: "🚨", 
        style: "bg-red-50/80 border-red-200 text-red-950 animate-pulse-slow"
      },
    };

    // Regex match strings inside text report
    const matchTuoiThai = reportText.match(/### 👶 Tuổi thai hiện tại([\s\S]*?)(?=###|$)/i);
    const matchDanhGia = reportText.match(/### ⚖️ Đánh giá cân nặng thai nhi([\s\S]*?)(?=###|$)/i);
    const matchNhanXet = reportText.match(/### 📈 Nhận xét sự phát triển([\s\S]*?)(?=###|$)/i);
    const matchDinhDuong = reportText.match(/### 🥗 Chế độ dinh dưỡng phù hợp với tuổi thai hiện tại([\s\S]*?)(?=###|$)/i) 
                          || reportText.match(/### 🥗 Chế độ dinh dưỡng phù hợp([\s\S]*?)(?=###|$)/i);
    const matchXetNghiem = reportText.match(/### 📅 Các xét nghiệm hoặc mốc khám thai cần lưu ý trong giai đoạn hiện tại([\s\S]*?)(?=###|$)/i) 
                          || reportText.match(/### 📅 Các xét nghiệm hoặc mốc khám thai cần lưu ý giai đoạn hiện tại([\s\S]*?)(?=###|$)/i)
                          || reportText.match(/### 📅 Các xét nghiệm[\s\S]*?lưu ý([\s\S]*?)(?=###|$)/i);
    const matchDauHieu = reportText.match(/### 🚨 Các dấu hiệu cần đi khám ngay([\s\S]*?)(?=###|$)/i);

    if (matchTuoiThai) sections.tuoi_thai.content = matchTuoiThai[1].trim();
    if (matchDanhGia) sections.danh_gia.content = matchDanhGia[1].trim();
    if (matchNhanXet) sections.nhan_xet.content = matchNhanXet[1].trim();
    if (matchDinhDuong) sections.dinh_duong.content = matchDinhDuong[1].trim();
    if (matchXetNghiem) sections.xet_nghiem.content = matchXetNghiem[1].trim();
    if (matchDauHieu) sections.dau_hieu.content = matchDauHieu[1].trim();

    // Check if regex parsed anything
    const hasParsed = Object.values(sections).some(s => s.content !== "");

    if (!hasParsed) {
      // Fallback display raw text inside beautiful simple container
      return (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm text-stone-800 leading-relaxed whitespace-pre-line text-sm" id="raw-report">
          {reportText}
        </div>
      );
    }

    // Capture the medical note separately at the end
    const rawNoteMatch = reportText.match(/Lưu ý:[\s\S]*/gi);
    const medicalNote = rawNoteMatch ? rawNoteMatch[0].trim() : "";

    return (
      <div className="space-y-6" id="report-cards-container">
        {Object.entries(sections).map(([key, sec]) => {
          if (!sec.content) return null;

          // Replace clean bolding and bullet markups inside Vietnamese texts
          const formattedContent = sec.content
            .split("\n")
            .filter(line => line.trim() !== "")
            .map((line, idx) => {
              const cleanLine = line.replace(/^\s*[-*•]\s*/, "").replace(/\*\*/g, "");
              const isBullet = /^\s*[-*•]/.test(line);
              const customIcon = isBullet ? getIconForLine(cleanLine) : null;

              return (
                <div key={idx} className={`flex items-start ${isBullet ? "pl-1.5 mt-2 gap-2" : "mt-2"}`}>
                  {isBullet ? (
                    <span className="text-base select-none shrink-0" role="img">{customIcon}</span>
                  ) : null}
                  <p className="text-sm leading-relaxed text-stone-850 font-normal">{cleanLine}</p>
                </div>
              );
            });

          return (
            <div 
              key={key} 
              className={`p-5 rounded-2xl border transition-all hover:shadow-md ${sec.style}`}
              id={`section-card-${key}`}
            >
              <div className="flex items-center space-x-2.5 mb-2.5 border-b border-stone-200/40 pb-2">
                <span className="text-xl" role="img" aria-label={sec.title}>{sec.icon}</span>
                <h4 className="font-semibold text-stone-900 text-base">{sec.title}</h4>
              </div>
              <div className="space-y-1.5 text-stone-800">
                {formattedContent}
              </div>
            </div>
          );
        })}

        {medicalNote && (
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 text-amber-900 text-xs leading-relaxed flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="font-medium whitespace-pre-line">{medicalNote}</p>
          </div>
        )}
      </div>
    );
  };

  // Main UI Render
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF8F5] via-[#FFFDFB] to-[#F1EDE7] text-stone-800 antialiased font-sans pb-16" id="applet-body">
      
      {/* Header Panel */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-stone-100 shadow-sm" id="main-header">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-inner">
              <Baby className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-rose-500 font-bold mb-0.5">Phòng khám Nội Tổng Hợp - Sản Phụ khoa & Siêu âm</p>
              <h1 className="text-xl font-bold text-stone-900 tracking-tight flex flex-wrap items-center gap-2">
                <span>Bác sĩ Biên - Bác sĩ CKI. Nguyễn Đình Huế</span>  
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-full shadow-sm">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <Sparkles className="w-2.5 h-2.5 text-emerald-600 animate-pulse" />
                  <span>Trợ lý Thai kỳ AI</span>
                </span>
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-3 gap-y-2 text-stone-500 text-[11px] sm:text-xs">
            <a href="tel:0327058775" className="flex items-center gap-1.5 hover:text-rose-600 transition-all font-bold text-rose-700 bg-rose-50/50 hover:bg-rose-50 border border-rose-100/80 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] transition-all group">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <Phone className="w-3 h-3 text-rose-500 shrink-0 group-hover:animate-bounce" />
              <span className="tracking-wide">Hotline: 0327058775</span>
            </a>
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full text-amber-900 font-bold text-[10px] sm:text-[11px] shadow-sm animate-pulse">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
              </span>
              <Clock className="w-3 h-3 text-amber-600 shrink-0" />
              <span className="tracking-wide">Giờ làm việc: 6h00 - 8h30 (Tối)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200/60 px-2.5 py-1 rounded-full text-stone-700 font-semibold text-[10px] sm:text-[11px] hover:border-stone-300 transition-all">
              <MapPin className="w-3 h-3 text-stone-500 shrink-0" />
              <span>Phước An, Nhơn Trạch, Đồng Nai</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8" id="main-content">
        
        {assessLoading ? (
          <div className="max-w-xl mx-auto py-8 px-4 animate-fade-in" id="clinical-processing-view">
            <div className="bg-white rounded-3xl border border-stone-150 p-6 sm:p-8 shadow-md text-center space-y-6">
              
              {/* Doctor Header */}
              <div className="flex flex-col items-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-3xl animate-bounce">
                  👩‍⚕️
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-lg">Hệ Thống Đang Tính Toán</h3>
                  <p className="text-xs text-stone-500 font-medium">Đối chiếu sinh trắc học quốc tế & Lập hồ sơ y khoa</p>
                </div>
              </div>

              {/* Glowing Circular Progress indicator */}
              <div className="py-2 animate-pulse-slow" id="progress-container">
                <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      className="stroke-stone-100"
                      strokeWidth="6"
                      fill="transparent"
                    />
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      className="stroke-emerald-600 transition-all duration-100 ease-linear"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 48}
                      strokeDashoffset={2 * Math.PI * 48 * (1 - loadingProgress / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="text-center">
                    <span className="text-2xl font-black text-stone-950 tracking-tight">{loadingProgress}%</span>
                    <span className="block text-[8px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">Tiến độ</span>
                  </div>
                </div>
              </div>

              {/* Active Medical Analysis Steps Tracker */}
              <div className="bg-stone-50 rounded-2xl border border-stone-100 p-4 text-left space-y-3" id="active-tasks-list">
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Trạng thái phân tích</p>
                
                <div className="space-y-2.5">
                  <div className="flex items-center space-x-2.5 text-xs">
                    <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      loadingProgress >= 20 ? "bg-emerald-500 text-white" : "bg-stone-200 text-stone-500"
                    }`}>
                      {loadingProgress >= 20 ? "✓" : "1"}
                    </span>
                    <span className={`${loadingProgress >= 0 && loadingProgress < 20 ? "font-bold text-[#1A3A34]" : "text-stone-500 font-medium"}`}>
                      Đồng bộ ngày dự sinh & mốc siêu âm Hadlock
                    </span>
                  </div>

                  <div className="flex items-center space-x-2.5 text-xs">
                    <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      loadingProgress >= 50 ? "bg-emerald-500 text-white" : "bg-stone-200 text-stone-500"
                    }`}>
                      {loadingProgress >= 50 ? "✓" : "2"}
                    </span>
                    <span className={`${loadingProgress >= 20 && loadingProgress < 50 ? "font-bold text-[#1A3A34]" : "text-stone-500 font-medium"}`}>
                      Định lượng bách phân vị thể trạng thực tế
                    </span>
                  </div>

                  <div className="flex items-center space-x-2.5 text-xs text-stone-800">
                    <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      loadingProgress >= 80 ? "bg-emerald-500 text-white" : "bg-stone-200 text-stone-500"
                    }`}>
                      {loadingProgress >= 80 ? "✓" : "3"}
                    </span>
                    <span className={`${loadingProgress >= 50 && loadingProgress < 80 ? "font-bold text-[#1A3A34]" : "text-stone-550 font-medium"}`}>
                      Lập thực đơn tẩm bổ & mốc kiểm tra bổ sung
                    </span>
                  </div>

                  <div className="flex items-center space-x-2.5 text-xs text-stone-800">
                    <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      loadingProgress >= 100 ? "bg-emerald-500 text-white" : "bg-stone-200 text-stone-500"
                    }`}>
                      {loadingProgress >= 100 ? "✓" : "4"}
                    </span>
                    <span className={`${loadingProgress >= 80 ? "font-bold text-[#1A3A34]" : "text-stone-400 font-medium"}`}>
                      Khởi tạo chuyên đề hồ sơ dinh dưỡng lâm sàng
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-600 animate-pulse tracking-wide flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                    {loadingProgress === 100 
                      ? "Đang xuất kết quả..." 
                      : loadingProgress >= 80
                      ? "Cẩm nang dinh dưỡng BS. Hoài..."
                      : loadingProgress >= 50
                      ? "Khớp bách phân vị Hadlock..."
                      : "Đối chiếu mốc sinh học thai..."
                    }
                  </span>
                  <span className="text-stone-400 font-semibold italic">Được tư vấn bởi BS. Hoài</span>
                </div>
              </div>

              {/* Rotating Pregnancy Tips Marquee Card inside processing state */}
              <div className="p-4 rounded-2xl bg-orange-50/40 border border-orange-100/50 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-orange-100/20 rounded-full -mr-4 -mt-4 blur-sm"></div>
                <div className="flex items-start space-x-3">
                  <span className="text-xl shrink-0">💡</span>
                  <div>
                    <h5 className="text-[10px] font-black text-orange-600 uppercase tracking-wider">Cẩm nang khuyên dùng từ BS. Hoài</h5>
                    <p className="text-xs text-stone-700 leading-relaxed font-semibold italic mt-1.5 transition-all duration-300">
                      "{LOADING_QUOTES[quoteIndex]}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : assessResult === null ? (
          <div className="max-w-xl mx-auto py-8" id="initial-input-form-container">
            <div className="bg-white rounded-3xl border border-stone-100 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3.5 mb-6 border-b border-stone-100 pb-4">
                <div className="w-11 h-11 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-inner shrink-0">
                  <Baby className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-lg">Đánh Giá Phát Triển Thai Nhi</h3>
                  <p className="text-xs text-stone-500">Tra cứu bách phân vị Hadlock & nhận chế độ dinh dưỡng AI của Bác sĩ Hoài</p>
                </div>
              </div>

              <form onSubmit={handleAssessSubmit} className="space-y-6" id="assessment-form">
                <div>
                  <label className="block text-sm font-semibold text-stone-800 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-stone-400" />
                    Ngày dự sinh (EDD)
                  </label>
                  <input
                    type="date"
                    value={edd}
                    onChange={(e) => setEdd(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-stone-900 font-medium text-sm"
                    id="input-edd-date"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Mốc tính tính dựa trên ngày đầu của Chu kỳ kinh cuối (LMP) hoặc siêu âm 12 tuần tuổi thai.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-800 mb-1.5 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-stone-400" />
                    Cân nặng thai ước tính (EFW)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="5"
                      max="6000"
                      value={efw}
                      onChange={(e) => setEfw(e.target.value)}
                      placeholder="Ví dụ: 350"
                      required
                      className="w-full pl-4 pr-16 py-3 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-stone-900 font-bold text-sm"
                      id="input-efw-grams"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-xs text-stone-400 pointer-events-none bg-stone-100/80 px-2 py-1 rounded">
                      gram
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Số liệu ước tính lấy từ phiếu kết quả đo đạc siêu âm định kỳ của bé yêu.
                  </p>
                </div>

                {assessError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-800 text-xs flex items-start space-x-2" id="assess-error-box">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                    <p className="font-semibold">{assessError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={assessLoading}
                  className="w-full bg-[#1A3A34] text-white font-bold py-3.5 rounded-xl hover:bg-[#122A25] active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-stone-900/10 flex items-center justify-center gap-2 text-sm"
                  id="btn-submit-assess"
                >
                  {assessLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang phân tích bách phân vị & lập thực đơn...</span>
                    </>
                  ) : (
                    <>
                      <Scale className="w-4 h-4 text-emerald-300" />
                      <span>Bắt đầu Phân tích Sinh trắc</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Pregnancy Q&A Block */}
            {renderPregnancyQASection()}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in" id="assess-grid-viewport">
              
              {/* Input Side Fields (allows recalculation on the fly) */}
              <div className="lg:col-span-5 space-y-6 order-2 lg:order-none" id="assess-input-pane">
                <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 border-b border-stone-100 pb-3">
                    <Baby className="w-5 h-5 text-emerald-500 shrink-0" />
                    <h3 className="font-bold text-stone-900 text-md">Cập Nhật Số Liệu</h3>
                  </div>

                  <form onSubmit={handleAssessSubmit} className="space-y-4" id="assessment-edit-form">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">EDD Ngày dự sinh</label>
                      <input
                        type="date"
                        value={edd}
                        onChange={(e) => setEdd(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none text-stone-950 font-medium text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Cân nặng thai nhi (gram)</label>
                      <input
                        type="number"
                        value={efw}
                        onChange={(e) => setEfw(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none text-stone-950 font-bold text-xs"
                      />
                    </div>

                    {assessError && (
                      <div className="p-3 rounded-lg bg-red-50 text-red-800 text-[11px] font-semibold">{assessError}</div>
                    )}

                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={assessLoading}
                        className="w-full bg-[#1A3A34] text-white font-bold py-3 rounded-xl hover:bg-[#122A25] transition-all text-xs flex items-center justify-center gap-1.5"
                      >
                        {assessLoading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Đang cập nhật...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Tính toán lại kết quả</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssessResult(null)}
                        className="w-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold py-2 rounded-xl transition-all text-xs"
                      >
                        Trở lại cổng chính
                      </button>
                    </div>
                  </form>
                </div>

                {/* Pregnancy Q&A Block inside Results View */}
                {renderPregnancyQASection()}
              </div>

              {/* Right Results and Custom SVG Charts Panel */}
              <div className="lg:col-span-7 space-y-6 order-1 lg:order-none" id="assess-display-pane">
                
                <div className="space-y-6" id="assessment-result-container">
                  
                  {/* Doctor Bien's Rich Advisory Report */}
                  <div className="bg-white rounded-3xl border border-stone-100 p-5 sm:p-8 shadow-sm" id="clinical-report-block">
                    <div className="flex items-center justify-between mb-5 border-b border-stone-100 pb-4">
                      <div className="flex items-center space-x-2.5">
                        <FileText className="w-5 h-5 text-rose-500" />
                        <h3 className="font-extrabold text-stone-900 text-lg">Báo Cáo Phân Tích Chuyên Sâu</h3>
                      </div>
                      <span className="text-xs text-stone-400 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Thời gian thực: {new Date().toLocaleDateString("vi-VN")}
                      </span>
                    </div>

                    {assessResult.report === "" ? (
                      <div className="space-y-5 py-2 animate-pulse-slow font-sans" id="ai-report-skeleton-loader">
                        
                        {/* Interactive clinical progress lists optimized for mobile touch heights */}
                        <div className="space-y-3.5">
                          <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100/50">
                            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-sm">✓</span>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-stone-900 flex items-center gap-1">
                                Tra cứu bách phân vị Hadlock
                              </p>
                              <p className="text-[11px] text-stone-550 font-medium">Bố trí vị trí đường cong bách phân vị hoàn tất sau 0ms.</p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-amber-50/40 border border-amber-100/30">
                            <div className="w-5 h-5 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 animate-spin border-t-amber-500 border-2 shadow-sm"></div>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-stone-900">Phác thảo thực đơn dồi dào dưỡng chất</p>
                              <p className="text-[11px] text-stone-550 font-medium">Tính toán định lượng Vitamin, Sắt & Canxi cho trẻ ở tuần {assessResult.weeks}W{assessResult.days}D.</p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-rose-50/20 border border-rose-100/10">
                            <span className="w-5 h-5 rounded-full bg-stone-150 text-stone-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-stone-400">Rà soát danh mục xét nghiệm & mốc tim thai</p>
                              <p className="text-[11px] text-stone-300 font-medium">Chuẩn bị cảnh báo và chỉ định y khoa tương thích tuổi thai hiện tại.</p>
                            </div>
                          </div>
                        </div>

                        {/* Rotating Doctor's Marquee advice cards specifically curated for pregnancy wellness */}
                        <div className="p-4 rounded-2xl bg-[#FCFAF7] border border-stone-100 mt-6 relative overflow-hidden shadow-sm">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-rose-100/15 rounded-full -mr-6 -mt-6 blur-md"></div>
                          <div className="flex gap-3">
                            <span className="text-2xl mt-0.5 select-none" role="img" aria-label="Bác sĩ Hoài">👩‍⚕️</span>
                            <div className="flex-1">
                              <p className="text-[10px] text-rose-500 uppercase font-black tracking-wider">Cẩm nang thai kỳ từ BS. Hoài</p>
                              <p className="text-xs text-stone-800 leading-relaxed font-semibold italic mt-1.5 transition-all duration-300">
                                "{LOADING_QUOTES[quoteIndex]}"
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="text-center pt-2">
                          <p className="text-[11px] text-stone-400 font-bold animate-pulse">Trợ lý AI đang lập thực đơn tẩm bổ, xin chờ mẹ giây lát...</p>
                        </div>

                      </div>
                    ) : (
                      renderReportCards(assessResult.report)
                    )}

                  </div>

                  {/* Summary Metric Strip Highlight */}
                  <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm" id="result-summary-card">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                      <div className="border-r border-stone-100 last:border-0 pr-2">
                        <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider block mb-1">Tuổi Thai</span>
                        <p className="font-black text-rose-500 text-xl tracking-tight">
                          {assessResult.weeks}W{assessResult.days}D
                        </p>
                        <p className="text-[10px] text-stone-500 font-medium mt-0.5">({assessResult.totalDays} ngày thai)</p>
                      </div>
                      <div className="border-r border-stone-100 last:border-0 pr-2 pb-2 sm:pb-0">
                        <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider block mb-1">Cân Nặng Ước Tính</span>
                        <p className="font-black text-stone-900 text-xl tracking-tight">
                          {assessResult.efw}g
                        </p>
                        <p className="text-[10px] text-indigo-500 font-semibold mt-0.5">Phần chuẩn: {assessResult.ref.p50}g</p>
                      </div>
                      <div className="border-r border-stone-100 last:border-0 pr-2">
                        <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider block mb-1">Thể Trạng</span>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border mt-1.5 ${
                          assessResult.evaluation === "Thai phát triển phù hợp tuổi thai"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}>
                          {assessResult.evaluation === "Thai phát triển phù hợp tuổi thai" ? "Chuẩn AGA" : "Theo dõi sát"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider block mb-1">Đánh Giá</span>
                        <p className={`font-bold text-xs mt-1.5 ${
                          assessResult.evaluation === "Thai phát triển phù hợp tuổi thai" 
                            ? "text-emerald-600" 
                            : "text-amber-600"
                        }`}>
                          {assessResult.evaluation}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Fetus Comparison Card - Beautifully Focused on Fetus Gestational Week! */}
                  <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm" id="week-explorer">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Apple className="w-5 h-5 text-orange-500" />
                        <h4 className="font-bold text-stone-900 text-sm">Theo dõi Kích Thước Bé</h4>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                        Tuần {explorerWeek}
                      </span>
                    </div>

                    <div className="mb-4">
                      <input
                        type="range"
                        min="12"
                        max="40"
                        value={explorerWeek}
                        onChange={(e) => setExplorerWeek(parseInt(e.target.value))}
                        className="w-full accent-[#1A3A34] cursor-pointer h-1.5 bg-stone-150 rounded-lg appearance-none"
                        id="slider-week-selector"
                      />
                      <div className="flex justify-between text-[10px] text-stone-400 mt-1 font-semibold">
                        <span>Tuần 12</span>
                        <span>Tuần 20</span>
                        <span>Tuần 30</span>
                        <span>Tuần 40</span>
                      </div>
                    </div>

                    {/* Fruit comparison showcase */}
                    <div className="p-4 rounded-2xl bg-[#FCFAF7] border border-stone-100 flex items-center space-x-4" id="explorer-fruit-card">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-stone-200/50 flex items-center justify-center text-3xl shadow-sm">
                        {explorerFruit.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">Kích thước bằng</p>
                        <h5 className="font-bold text-stone-900 text-sm">{explorerFruit.name}</h5>
                        <p className="text-xs text-indigo-600 font-semibold mt-0.5">Chiều dài ước tính: ~{explorerFruit.size}</p>
                      </div>
                    </div>

                    <div className="mt-3.5 p-3 rounded-xl bg-stone-50 border border-stone-100/50">
                      <p className="text-xs text-stone-600 leading-relaxed italic">
                        "{explorerFruit.desc}"
                      </p>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-stone-100 grid grid-cols-3 gap-2 text-center text-[11px]" id="growth-benchmarks">
                      <div>
                        <span className="block text-stone-400 font-semibold mb-0.5">Nhỏ hơn p10</span>
                        <span className="font-bold text-amber-600">&lt; {explorerRef.p10}g</span>
                      </div>
                      <div>
                        <span className="block text-stone-400 font-semibold mb-0.5">Lý tưởng/Trung bình</span>
                        <span className="font-bold text-emerald-600">{explorerRef.p50}g</span>
                      </div>
                      <div>
                        <span className="block text-stone-400 font-semibold mb-0.5">Lớn hơn p90</span>
                        <span className="font-bold text-amber-600">&gt; {explorerRef.p90}g</span>
                      </div>
                    </div>
                  </div>

                  {/* SVG Percentile Chart inside assessment */}
                  <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm" id="result-chart-card">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm">Biểu Đồ Tăng Trưởng Thai Nhi (Hadlock Standard)</h4>
                        <p className="text-[10.5px] text-stone-400">Vị trí cân nặng bé yêu trên đường bách phân vị chuẩn.</p>
                      </div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setIsZoomed(!isZoomed)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-[#EAF5F2] hover:bg-[#D6EBE5] text-[#12312C] border border-[#BBDED4] transition-all shadow-sm shrink-0"
                          id="btn-toggle-growth-zoom"
                        >
                          {isZoomed ? "🔍 Xem toàn thai kỳ" : "🔍 Zoom tuần hiện tại"}
                        </button>
                        <div className="flex gap-2.5 text-[10px] font-bold">
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500/10 border border-emerald-400" /> Chuẩn AGA</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" /> Bé của bạn</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative overflow-x-auto" id="svg-chart-wrapper">
                      <svg 
                        viewBox={`0 0 ${plotWidth} ${plotHeight}`}
                        className="w-full min-w-[450px] overflow-visible"
                      >
                        {/* Define beautiful soft gradients */}
                        <defs>
                          <linearGradient id="growthZone" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.08" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                          </linearGradient>
                        </defs>

                        {/* Chart grid lines */}
                        {Array.from({ length: maxW - minW + 1 }).map((_, idx) => {
                          const w = minW + idx;
                          return (
                            <line
                              key={idx}
                              x1={mapX(w)}
                              y1={paddingTop}
                              x2={mapX(w)}
                              y2={plotHeight - paddingBottom}
                              stroke="#e7e5e4"
                              strokeWidth="1"
                              strokeDasharray="2 3"
                            />
                          );
                        })}

                        {Array.from({ length: 5 }).map((_, idx) => {
                          const val = minY + (idx * (maxY - minY)) / 4;
                          return (
                            <line
                              key={idx}
                              x1={paddingLeft}
                              y1={mapY(val)}
                              x2={plotWidth - paddingRight}
                              y2={mapY(val)}
                              stroke="#e7e5e4"
                              strokeWidth="1"
                              strokeDasharray="2 3"
                            />
                          );
                        })}

                        {/* Optimal shading (p10 to p90 range) */}
                        <polygon
                          points={zonePoints}
                          fill="url(#growthZone)"
                        />

                        {/* Draw curves */}
                        <path
                          d={p10LinePath}
                          fill="none"
                          stroke="#cbd5e1"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                          id="p10-curve-path"
                        />
                        <path
                          d={p50LinePath}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3.5"
                          id="p50-curve-path"
                        />
                        <g>
                          <path
                            d={p90LinePath}
                            fill="none"
                            stroke="#cbd5e1"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            id="p90-curve-path"
                          />
                        </g>

                        {/* Chart labels bottom */}
                        {Array.from({ length: maxW - minW + 1 }).map((_, idx) => {
                          const w = minW + idx;
                          return (
                            <text
                              key={idx}
                              x={mapX(w)}
                              y={plotHeight - paddingBottom + 16}
                              textAnchor="middle"
                              className="fill-stone-400 font-bold text-[10px]"
                            >
                              T{w}
                            </text>
                          );
                        })}
                        <text
                          x={plotWidth / 2 + 15}
                          y={plotHeight - 8}
                          textAnchor="middle"
                          className="fill-stone-400 font-black text-[10px] uppercase tracking-wider"
                        >
                          Tuần tuổi thai (W)
                        </text>

                        {/* Chart labels Left Y-axis */}
                        {Array.from({ length: 5 }).map((_, idx) => {
                          const val = minY + (idx * (maxY - minY)) / 4;
                          const formattedVal = Math.round(val);
                          return (
                            <text
                              key={idx}
                              x={paddingLeft - 8}
                              y={mapY(formattedVal) + 3}
                              textAnchor="end"
                              className="fill-stone-400 font-bold text-[10px]"
                            >
                              {formattedVal}g
                            </text>
                          );
                        })}

                        {/* Hover reference values labeled along borders */}
                        <text x={mapX(maxW - 0.4)} y={mapY(getFetalWeightReference(maxW).p90) - 6} className="fill-stone-400 text-[9px] font-bold">p90</text>
                        <text x={mapX(maxW - 0.4)} y={mapY(getFetalWeightReference(maxW).p50) - 6} className="fill-emerald-600 text-[9px] font-heavy font-sans-serif">p50 (Trung bình)</text>
                        <text x={mapX(maxW - 0.4)} y={mapY(getFetalWeightReference(maxW).p10) - 6} className="fill-stone-400 text-[9px] font-bold">p10</text>

                        {/* The plotted fetus coordinate point */}
                        {assessResult.weeks >= minW && assessResult.weeks <= maxW && (
                          <g>
                            {/* Blinking glow effect background */}
                            <circle
                              cx={mapX(assessResult.weeks)}
                              cy={mapY(assessResult.efw)}
                              r="10"
                              className="fill-rose-400/20 stroke-rose-400/10 animate-pulse"
                            />
                            {/* Inner dot */}
                            <circle
                              cx={mapX(assessResult.weeks)}
                              cy={mapY(assessResult.efw)}
                              r="4.5"
                              className="fill-rose-500 stroke-white stroke-[1.5]"
                              id="plotted-fetus-dot"
                            />
                          </g>
                        )}
                      </svg>
                    </div>
                  </div>

                </div>

              </div>
              
          </div>
        )}

      </main>

      {/* Footer Branding Area */}
      <footer className="mt-20 border-t border-stone-200/60 bg-stone-100/60 py-10 text-center" id="main-footer">
        <div className="max-w-6xl mx-auto px-4 text-stone-500 text-xs space-y-3">
          <p className="font-bold text-stone-700">© 2026 Phòng khám Nội Tổng Hợp - Sản Phụ khoa & Siêu âm Bác sĩ Biên - Bác sĩ CKI. Nguyễn Đình Huế. Bảo lưu mọi quyền.</p>
          <p className="text-[11px] text-stone-500 font-semibold" id="footer-clinic-hours">
            Địa chỉ: Chợ Long Thọ, Phước An, Đồng Nai | Hotline: 0327058775 | Giờ làm việc hàng ngày: 6:00 - 8:30 (Tối)
          </p>
          <p className="max-w-2xl mx-auto text-[11px] leading-relaxed">
            Hệ thống Trợ lý Thai kỳ AI thuộc bản quyền công nghệ thông tin y khoa Phòng khám Bác sĩ Biên - Bác sĩ CKI. Nguyễn Đình Huế. 
            Mọi lời khuyên chăm sóc sức khỏe, chế độ dinh dưỡng, xét nghiệm cần luôn tuân chỉ theo sự chẩn đoán lâm sàng của bác sĩ sản khoa trực tiếp chăm sóc thai kỳ của bạn.
          </p>
        </div>
      </footer>

    </div>
  );
}
