import { AppData, ComparisonField, TVModel } from './types';

export const INITIAL_FIELDS: ComparisonField[] = [
  {
    id: "screen_size",
    label: "حجم الشاشة",
    type: "dimension",
    unit: "بوصة",
    order: 1,
    is_highlightable: false,
    comparison_rule: "higher_is_better"
  },
  {
    id: "resolution",
    label: "الدقة",
    type: "select",
    options: ["HD", "FHD", "4K", "8K"],
    order: 2,
    is_highlightable: true,
    highlight_color: "#3b82f6",
    comparison_rule: "none"
  },
  {
    id: "panel_type",
    label: "نوع اللوحة",
    type: "select",
    options: ["LED", "QLED", "OLED", "Mini-LED"],
    order: 3,
    is_highlightable: true,
    highlight_color: "#8b5cf6",
    comparison_rule: "none"
  },
  {
    id: "refresh_rate",
    label: "معدل التحديث",
    type: "number",
    unit: "Hz",
    order: 4,
    is_highlightable: true,
    highlight_color: "#22c55e", // Green for gaming feature
    highlight_icon: "zap",
    comparison_rule: "higher_is_better"
  },
  {
    id: "hdr_support",
    label: "دعم HDR",
    type: "boolean",
    order: 5,
    is_highlightable: false,
    comparison_rule: "equal"
  },
  {
    id: "smart_os",
    label: "نظام التشغيل",
    type: "text",
    order: 6,
    is_highlightable: false,
    comparison_rule: "none"
  },
  {
    id: "hdmi_ports",
    label: "مداخل HDMI 2.1",
    type: "number",
    order: 7,
    is_highlightable: true,
    comparison_rule: "higher_is_better"
  }
];

export const INITIAL_MODELS: TVModel[] = [
  {
    id: "lg-c3",
    brand: "LG",
    name: "LG OLED C3",
    slug: "lg-oled-c3",
    images: ["https://picsum.photos/400/300?random=1"],
    specs: {
      screen_size: 55,
      resolution: "4K",
      panel_type: "OLED",
      refresh_rate: 120,
      hdr_support: true,
      smart_os: "WebOS 23",
      hdmi_ports: 4
    }
  },
  {
    id: "samsung-s95c",
    brand: "Samsung",
    name: "Samsung S95C OLED",
    slug: "samsung-s95c",
    images: ["https://picsum.photos/400/300?random=2"],
    specs: {
      screen_size: 65,
      resolution: "4K",
      panel_type: "OLED",
      refresh_rate: 144,
      hdr_support: true,
      smart_os: "Tizen",
      hdmi_ports: 4
    }
  },
  {
    id: "sony-a80l",
    brand: "Sony",
    name: "Sony Bravia XR A80L",
    slug: "sony-a80l",
    images: ["https://picsum.photos/400/300?random=3"],
    specs: {
      screen_size: 55,
      resolution: "4K",
      panel_type: "OLED",
      refresh_rate: 120,
      hdr_support: true,
      smart_os: "Google TV",
      hdmi_ports: 2
    }
  },
  {
    id: "tcl-c845",
    brand: "TCL",
    name: "TCL C845 Mini-LED",
    slug: "tcl-c845",
    images: ["https://picsum.photos/400/300?random=4"],
    specs: {
      screen_size: 65,
      resolution: "4K",
      panel_type: "Mini-LED",
      refresh_rate: 144,
      hdr_support: true,
      smart_os: "Google TV",
      hdmi_ports: 2
    }
  }
];