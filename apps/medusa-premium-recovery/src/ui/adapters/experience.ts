export type PRExperienceState =
  | "idle"
  | "analyzing"
  | "selecting"
  | "metadata"
  | "review"
  | "creating"
  | "done"
  | "error"

export type PRExperienceView = {
  title: string
  description: string
  nextLabel: string
  backLabel: string
  nextDisabled: boolean
  showProgress: boolean
  showBack: boolean
  progress: number
}

const experienceMap: Record<PRExperienceState, PRExperienceView> = {
  idle: {
    title: "آماده",
    description: "",
    nextLabel: "شروع",
    backLabel: "",
    nextDisabled: true,
    showProgress: false,
    showBack: false,
    progress: 0,
  },
  analyzing: {
    title: "بررسی تغییرات",
    description: "در حال بررسی مخزن...",
    nextLabel: "در حال بررسی...",
    backLabel: "",
    nextDisabled: true,
    showProgress: true,
    showBack: false,
    progress: 25,
  },
  selecting: {
    title: "انتخاب فایل‌ها",
    description: "فایل‌های تغییر یافته را انتخاب کنید",
    nextLabel: "ادامه",
    backLabel: "",
    nextDisabled: false,
    showProgress: true,
    showBack: false,
    progress: 33,
  },
  metadata: {
    title: "اطلاعات اسنپ‌شات",
    description: "نام و توضیحات اسنپ‌شات را وارد کنید",
    nextLabel: "ادامه",
    backLabel: "بازگشت",
    nextDisabled: false,
    showProgress: true,
    showBack: true,
    progress: 66,
  },
  review: {
    title: "بازبینی",
    description: "اطلاعات را بررسی و تأیید کنید",
    nextLabel: "ایجاد اسنپ‌شات",
    backLabel: "بازگشت",
    nextDisabled: false,
    showProgress: true,
    showBack: true,
    progress: 90,
  },
  creating: {
    title: "در حال ایجاد...",
    description: "لطفا چند لحظه صبر کنید",
    nextLabel: "در حال ایجاد...",
    backLabel: "",
    nextDisabled: true,
    showProgress: false,
    showBack: false,
    progress: 95,
  },
  done: {
    title: "ایجاد شد",
    description: "اسنپ‌شات با موفقیت ایجاد شد",
    nextLabel: "بستن",
    backLabel: "",
    nextDisabled: false,
    showProgress: false,
    showBack: false,
    progress: 100,
  },
  error: {
    title: "خطا",
    description: "خطا در ایجاد اسنپ‌شات",
    nextLabel: "تلاش مجدد",
    backLabel: "",
    nextDisabled: false,
    showProgress: false,
    showBack: false,
    progress: 100,
  },
}

export function getExperienceView(
  state: PRExperienceState
): PRExperienceView {
  return experienceMap[state] ?? experienceMap.idle
}
