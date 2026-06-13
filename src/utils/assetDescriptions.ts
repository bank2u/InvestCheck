export interface AssetDescription {
  description: string;
  examples: string;
}

export const ASSET_DESCRIPTIONS: Record<string, AssetDescription> = {
  'เงินฝาก & พันธบัตร': {
    description: 'ฝากเงินหรือให้รัฐ/บริษัทกู้ รับดอกเบี้ยสม่ำเสมอ ความเสี่ยงต่ำ',
    examples: 'เงินฝากประจำ, กองทุนตลาดเงิน, พันธบัตรรัฐบาล, หุ้นกู้เอกชน',
  },
  'หุ้น': {
    description: 'ซื้อความเป็นเจ้าของบริษัท โอกาสผลตอบแทนสูงกว่าเงินฝาก แต่ราคาขึ้นลงได้',
    examples: 'กองทุนหุ้นไทย, กองทุนหุ้นต่างประเทศ, ETF',
  },
  'ทางเลือก': {
    description: 'สินทรัพย์นอกเหนือหุ้นและพันธบัตร ช่วยกระจายความเสี่ยงในพอร์ต',
    examples: 'ทองคำ, กองทุนอสังหาริมทรัพย์ (REITs), กองทุนน้ำมัน',
  },
};
