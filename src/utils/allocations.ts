import { RiskLevel, AllocationSet } from '../types';

export const ALLOCATIONS: Record<RiskLevel, AllocationSet> = {
  1: {
    debt: { name: 'เงินฝาก & พันธบัตร', percentage: 90, color: '#10b981' },
    equity: { name: 'หุ้น', percentage: 5, color: '#f59e0b' },
    alternative: { name: 'ทางเลือก', percentage: 5, color: '#8b5cf6' },
  },
  2: {
    debt: { name: 'เงินฝาก & พันธบัตร', percentage: 70, color: '#10b981' },
    equity: { name: 'หุ้น', percentage: 20, color: '#f59e0b' },
    alternative: { name: 'ทางเลือก', percentage: 10, color: '#8b5cf6' },
  },
  3: {
    debt: { name: 'เงินฝาก & พันธบัตร', percentage: 60, color: '#10b981' },
    equity: { name: 'หุ้น', percentage: 30, color: '#f59e0b' },
    alternative: { name: 'ทางเลือก', percentage: 10, color: '#8b5cf6' },
  },
  4: {
    debt: { name: 'เงินฝาก & พันธบัตร', percentage: 40, color: '#10b981' },
    equity: { name: 'หุ้น', percentage: 40, color: '#f59e0b' },
    alternative: { name: 'ทางเลือก', percentage: 20, color: '#8b5cf6' },
  },
  5: {
    debt: { name: 'เงินฝาก & พันธบัตร', percentage: 15, color: '#10b981' },
    equity: { name: 'หุ้น', percentage: 60, color: '#f59e0b' },
    alternative: { name: 'ทางเลือก', percentage: 25, color: '#8b5cf6' },
  },
};
