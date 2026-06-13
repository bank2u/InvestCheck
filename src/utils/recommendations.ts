import { RiskLevel, RiskProfile } from '../types';
import { ALLOCATIONS } from './allocations';
import { getScoreRange } from './scoring';

export const RISK_PROFILES: Record<RiskLevel, RiskProfile> = {
  1: {
    level: 1,
    thaiName: 'เสี่ยงต่ำ',
    scoreRange: getScoreRange(1),
    allocations: ALLOCATIONS[1],
    recommendation: 'คุณชอบปลอดภัย เหมาะเก็บเงินไว้ใช้เร็ว ๆ หรือไม่อยากเสียเงินเลย ลงทุนตามนี้จะนอนหลับสบาย',
    color: '#EF4444',
  },
  2: {
    level: 2,
    thaiName: 'เสี่ยงปานกลางค่อนข้างต่ำ',
    scoreRange: getScoreRange(2),
    allocations: ALLOCATIONS[2],
    recommendation: 'คุณระมัดระวัง แต่อยากให้เงินเพิ่มขึ้นด้วย เหมาะสำหรับผู้ที่อยากได้ดอกผลแต่ไม่อยากเสี่ยง ปล่อยเงิน 3-5 ปี',
    color: '#F97316',
  },
  3: {
    level: 3,
    thaiName: 'เสี่ยงปานกลางค่อนข้างสูง',
    scoreRange: getScoreRange(3),
    allocations: ALLOCATIONS[3],
    recommendation: 'คุณยอมรับความเสี่ยงเพื่อเงินเพิ่มขึ้นมากขึ้น ปล่อยเงิน 3-5 ปี จะเห็นผลดีต่อเมื่อตลาดขึ้น',
    color: '#FBBF24',
  },
  4: {
    level: 4,
    thaiName: 'เสี่ยงสูง',
    scoreRange: getScoreRange(4),
    allocations: ALLOCATIONS[4],
    recommendation: 'คุณกล้าเสี่ยง อยากให้เงินเพิ่มเร็ว ต้องรับว่าหุ้นขึ้นลงได้ ปล่อยเงิน 5+ ปี จึงจะดีที่สุด',
    color: '#3B82F6',
  },
  5: {
    level: 5,
    thaiName: 'เสี่ยงสูงมาก',
    scoreRange: getScoreRange(5),
    allocations: ALLOCATIONS[5],
    recommendation: 'คุณพร้อมสำหรับการลงทุนจริง ๆ อยากได้กำไรสูง ต้องทนเห็นเงินลดลง แล้วขึ้นมา ต้องมองไกล 7-10 ปี',
    color: '#1E40AF',
  },
};

export function getRiskProfile(level: RiskLevel): RiskProfile {
  return RISK_PROFILES[level];
}
